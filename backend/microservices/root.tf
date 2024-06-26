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

# Logging
resource "aws_cloudwatch_log_group" "api_gw2" {
  name = "/aws/api_gw2/${aws_apigatewayv2_api.mewsic_api2.name}"

  retention_in_days = 30
}