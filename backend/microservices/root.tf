terraform {
  cloud {
    organization = "Mewsic"
    workspaces {
      name = "Mewsic-auth"
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
module "test" {
    source = "./test"
}

module "auth" {
    source = "./auth"
}

# Create API Gateway
resource "aws_apigatewayv2_api" "mewsic_api2" {
  name          = "mewsic_api2"
  protocol_type = "HTTP"
  cors_configuration {
    allow_headers = ["Content-Type", "Authorization"]
    allow_origins = ["http://localhost:8081"]
    allow_methods = ["POST", "GET", "OPTIONS"]
  }
}

resource "aws_apigatewayv2_stage" "mewsic_stage2" {
  api_id = aws_apigatewayv2_api.mewsic_api2.id

  name        = "mewsic_stage2"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw2.arn

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

### Test lambda

# Integration of test lambda
resource "aws_apigatewayv2_integration" "test" {
  api_id = aws_apigatewayv2_api.mewsic_api2.id

  integration_uri    = module.test.testLambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "test" {
  api_id = aws_apigatewayv2_api.mewsic_api2.id

  route_key = "POST /hello"
  target    = "integrations/${aws_apigatewayv2_integration.test.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.gatewayAuth.id
}

# Logging
resource "aws_cloudwatch_log_group" "api_gw2" {
  name = "/aws/api_gw2/${aws_apigatewayv2_api.mewsic_api2.name}"

  retention_in_days = 30
}

# Permission for test lambda
resource "aws_lambda_permission" "api_gw2" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = module.test.testLambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.mewsic_api2.execution_arn}/*/*"
}

### Auth Lambda

// TODO: don't need this anymore
resource "aws_apigatewayv2_authorizer" "auth" {
  api_id           = aws_apigatewayv2_api.mewsic_api2.id

  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = [module.auth.userPoolClient.id]
    issuer   = "https://${module.auth.userPool.endpoint}"
  }
}

resource "aws_apigatewayv2_integration" "auth" {
  api_id = aws_apigatewayv2_api.mewsic_api2.id

  integration_uri = module.auth.signInLambda.invoke_arn
  integration_type = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "auth" {
  api_id    = aws_apigatewayv2_api.mewsic_api2.id

  route_key = "GET /example"
  target = "integrations/${aws_apigatewayv2_integration.auth.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.gatewayAuth.id
}

resource "aws_apigatewayv2_authorizer" "gatewayAuth" {
  api_id           = aws_apigatewayv2_api.mewsic_api2.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "Mewsic-cognito-authorizer"

  jwt_configuration {
    audience = [module.auth.userPoolClient.id]
    issuer   = "https://${module.auth.userPool.endpoint}"
  }
}
