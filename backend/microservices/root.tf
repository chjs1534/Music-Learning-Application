terraform {
  cloud {
    organization = "Mewsic"
    workspaces {
      name = "Mewsic-workspace"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "ap-southeast-2"
}

# Modules
module "upload" {
    source = "./upload"
}

module "auth" {
    source = "./auth"
}

# Create API Gateway
resource "aws_apigatewayv2_api" "mewsic_api" {
  name          = "mewsic_api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_headers = ["Content-Type", "Authorization"]
    allow_origins = ["http://localhost:8081"]
    allow_methods = ["POST", "GET", "OPTIONS"]
  }
}

resource "aws_apigatewayv2_stage" "mewsic_stage" {
  api_id = aws_apigatewayv2_api.mewsic_api.id

  name        = "mewsic_stage"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_authorizer" "gatewayAuth" {
  api_id           = aws_apigatewayv2_api.mewsic_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "Mewsic-cognito-authorizer"

  jwt_configuration {
    audience = [module.auth.userPoolClient.id]
    issuer   = "https://${module.auth.userPool.endpoint}"
  }
}

# Integration of test lambda
resource "aws_apigatewayv2_integration" "upload" {
  api_id = aws_apigatewayv2_api.mewsic_api.id

  integration_uri    = module.upload.upload_lambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "upload" {
  api_id = aws_apigatewayv2_api.mewsic_api.id

  route_key = "POST /upload"
  target    = "integrations/${aws_apigatewayv2_integration.upload.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.gatewayAuth.id
}

resource "aws_apigatewayv2_integration" "download" {
  api_id = aws_apigatewayv2_api.mewsic_api.id

  integration_uri    = module.upload.download_lambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "download" {
  api_id = aws_apigatewayv2_api.mewsic_api.id

  route_key = "POST /download"
  target    = "integrations/${aws_apigatewayv2_integration.download.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.gatewayAuth.id
}

# Logging
resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.mewsic_api.name}"

  retention_in_days = 30
}

# Permission for test lambda
resource "aws_lambda_permission" "api_gw_upload" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = module.upload.upload_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.mewsic_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gw_download" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = module.upload.download_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.mewsic_api.execution_arn}/*/*"
}

output "base_url" {
  description = "Base URL for API Gateway stage."

  value = aws_apigatewayv2_stage.mewsic_stage.invoke_url
}

output "video_storage_name" {
  description = "Name of the S3 bucket used to store function code."

  value = module.upload.video_storage_name
}








