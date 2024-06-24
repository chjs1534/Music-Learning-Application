# module "apigateway" {
#     source = "./apigateway"
# }

# Test module
module "terraform" {
    source = "./terraform"
}

module "auth" {
    source = "./auth"
}

# Create API Gateway
resource "aws_apigatewayv2_api" "mewsic_api" {
  name          = "mewsic_api"
  protocol_type = "HTTP"
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

# Integration of test lambda
resource "aws_apigatewayv2_integration" "hello_world" {
  api_id = aws_apigatewayv2_api.mewsic_api.id

  integration_uri    = module.terraform.helloLambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "hello_world" {
  api_id = aws_apigatewayv2_api.mewsic_api.id

  route_key = "POST /hello"
  target    = "integrations/${aws_apigatewayv2_integration.hello_world.id}"
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.mewsic_api.name}"

  retention_in_days = 30
}

# Permission for test lambda
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = module.terraform.helloLambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.mewsic_api.execution_arn}/*/*"
}

# Auth
resource "aws_apigatewayv2_authorizer" "auth" {
  api_id           = aws_apigatewayv2_api.mewsic_api.id

  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = [module.auth.userPoolClient.id]
    issuer   = "https://${module.auth.userPool.endpoint}"
  }
}

resource "aws_apigatewayv2_integration" "auth" {
  api_id = aws_apigatewayv2_api.mewsic_api.id

  integration_uri = module.auth.signInLambda.invoke_arn // TODO
  integration_type = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "auth" {
  api_id    = aws_apigatewayv2_api.mewsic_api.id

  route_key = "GET /example"
  target = "integrations/${aws_apigatewayv2_integration.auth.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.auth.id
}

