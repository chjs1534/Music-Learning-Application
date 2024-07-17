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

# Logging
resource "aws_iam_role" "apigateway_logging_role" {
  name = "APIGatewayCloudWatchLogsRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "apigateway.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "cloudwatch" {
  name = "default"
  role = "${aws_iam_role.apigateway_logging_role.id}"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams",
                "logs:PutLogEvents",
                "logs:GetLogEvents",
                "logs:FilterLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "apigateway_logging_role_policy" {
  role       = aws_iam_role.apigateway_logging_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_api_gateway_account" "apigateway_account" {
  cloudwatch_role_arn = aws_iam_role.apigateway_logging_role.arn
}

# Create API Gateway with WebSocket protocol
resource "aws_apigatewayv2_api" "mewsic_api_websocket" {
  name          = "mewsic_api_websocket"
  protocol_type = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_apigatewayv2_stage" "mewsic_stage_websocket" {
  api_id = aws_apigatewayv2_api.mewsic_api_websocket.id

  name        = "mewsic_stage_websocket"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw_websocket.arn

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

# resource "aws_apigatewayv2_authorizer" "mewsic_gateway_auth_websocket" {
#   api_id           = aws_apigatewayv2_api.mewsic_api_websocket.id
#   authorizer_type  = "REQUEST"
#   authorizer_uri = 
#   identity_sources = ["$request.header.Authorization"]
#   name             = "Mewsic-cognito-authorizer"
# }

resource "aws_cloudwatch_log_group" "api_gw_websocket" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.mewsic_api_websocket.name}"

  retention_in_days = 30
}

output "base_url_websocket" {
  description = "Base URL for API Gateway stage."

  value = aws_apigatewayv2_stage.mewsic_stage_websocket.invoke_url
}

output "mewsic_api_websocket" {
    value = aws_apigatewayv2_api.mewsic_api_websocket
}

output "mewsic_api_id_websocket" {
    value = aws_apigatewayv2_api.mewsic_api_websocket.id
}

# output "mewsic_gateway_auth_id_websocket" {
#     value = aws_apigatewayv2_authorizer.mewsic_gateway_auth_websocket.id
# }