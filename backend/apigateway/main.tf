terraform {
  cloud {
    organization = "Mewsic"
    workspaces {
      name = "Mewsic-workspace-apigateway"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Access outputs from auth workspace
data "terraform_remote_state" "Mewsic-workspace-auth" {
  backend = "remote"
  config = {
    organization = "Mewsic"
    workspaces = {
      name = "Mewsic-workspace-auth"
    }
  }
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

# Authorisation
resource "aws_apigatewayv2_authorizer" "mewsic_gateway_auth" {
  api_id           = aws_apigatewayv2_api.mewsic_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "Mewsic-cognito-authorizer"

  jwt_configuration {
    audience = [data.terraform_remote_state.Mewsic-workspace-auth.outputs.userPoolClient.id]
    issuer   = "https://${data.terraform_remote_state.Mewsic-workspace-auth.outputs.userPool.endpoint}"
  }
}

resource "aws_apigatewayv2_authorizer" "mewsic_gateway_auth_mobile" {
  api_id           = aws_apigatewayv2_api.mewsic_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "Mewsic-cognito-authorizer-mobile"

  jwt_configuration {
    audience = [data.terraform_remote_state.Mewsic-workspace-auth.outputs.userPoolClientMobile.id]
    issuer   = "https://${data.terraform_remote_state.Mewsic-workspace-auth.outputs.userPoolMobile.endpoint}"
  }
}

# Logging
resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.mewsic_api.name}"

  retention_in_days = 30
}

# Outputs
output "base_url" {
  description = "Base URL for API Gateway stage."

  value = aws_apigatewayv2_stage.mewsic_stage.invoke_url
}

output "mewsic_api" {
    value = aws_apigatewayv2_api.mewsic_api
}

output "mewsic_api_id" {
    value = aws_apigatewayv2_api.mewsic_api.id
}

output "mewsic_gateway_auth_id" {
    value = aws_apigatewayv2_authorizer.mewsic_gateway_auth.id
}

output "mewsic_gateway_auth_mobile_id" {
    value = aws_apigatewayv2_authorizer.mewsic_gateway_auth_mobile.id
}
