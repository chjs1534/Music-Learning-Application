terraform {
  cloud {
    organization = "Mewsic"
    workspaces {
      name = "Mewsic-workspace-messaging"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Access outputs from apigateway workspace
data "terraform_remote_state" "Mewsic-workspace-apigateway" {
  backend = "remote"
  config = {
    organization = "Mewsic"
    workspaces = {
      name = "Mewsic-workspace-apigateway"
    }
  }
}

# Messaging table
resource "aws_dynamodb_table" "messaging-table" {
  name           = "MessagingTable"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "connectionId"

  attribute {
    name = "connectionId"
    type = "S"
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = true
  }
}

# Lambdas
# Generate s3 bucket name
resource "random_pet" "lambda_bucket_name" {
  length = 4
}

# Generate s3 bucket
resource "aws_s3_bucket" "lambda_bucket" {
  bucket = random_pet.lambda_bucket_name.id
}

# Configure s3 bucket
resource "aws_s3_bucket_ownership_controls" "lambda_bucket" {
  bucket = aws_s3_bucket.lambda_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "lambda_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.lambda_bucket]

  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}

# Create zip file of lambdas
data "archive_file" "lambdas" {
  type = "zip"
  
  source_dir  = "${path.module}/lambdas"
  output_path = "${path.module}/messagingLambdas.zip"
}

# Store lambdas zip in s3
resource "aws_s3_object" "lambdas" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "messagingLambdas.zip"
  source = data.archive_file.lambdas.output_path

  etag = filemd5(data.archive_file.lambdas.output_path)
}

# Policies and roles for lambdas
resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda_messaging"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_dynamodb_policy_messaging" {
  name = "lambda_dynamodb_policy_messaging"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:DeleteItem",
          "dynamodb:PutItem",
          "dynamodb:Scan"
        ],
        Resource = [
          aws_dynamodb_table.messaging-table.arn
        ],
      },
    ],
  })
}

// For send message
resource "aws_iam_policy" "apigateway_manage_connections_policy" {
  name        = "APIGatewayManageConnectionsPolicy"
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "execute-api:ManageConnections"
        ],
        Resource = [
           "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_stage_websocket.execution_arn}/*/@connections/*"
        ]
      },
    ],
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  for_each = {
    "AWSLambdaBasicExecutionRole": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "AWSDynamodbRole": aws_iam_policy.lambda_dynamodb_policy_messaging.arn,
    "AWSConnectionsRole": aws_iam_policy.apigateway_manage_connections_policy.arn
  }
  role       = aws_iam_role.lambda_exec.name
  policy_arn = each.value
}

# sendMessage lambda
resource "aws_lambda_function" "sendMessage" {
  function_name = "SendMessage"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "sendMessage.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "sendMessage" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id_websocket

  integration_uri    = aws_lambda_function.sendMessage.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "sendMessage" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_websocket.id

  route_key = "sendMessage"
  target    = "integrations/${aws_apigatewayv2_integration.sendMessage.id}"
#   authorization_type = "REQUEST"
#   authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id_websocket
}

resource "aws_lambda_permission" "api_gw_sendMessage" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sendMessage.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_websocket.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gw_sendMessage_manage_connections" {
  statement_id  = "AllowExecutionFromAPIGatewayManageConnections"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sendMessage.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_websocket.execution_arn}/*/@connections/*"
}

resource "aws_cloudwatch_log_group" "sendMessage" {
  name = "/aws/lambda/${aws_lambda_function.sendMessage.function_name}"

  retention_in_days = 30
}

# Connect lambda
resource "aws_lambda_function" "connect" {
  function_name = "Connect"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "connect.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "connect" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id_websocket

  integration_uri    = aws_lambda_function.connect.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "connect" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_websocket.id

  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.connect.id}"
#   authorization_type = "REQUEST"
#   authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id_websocket
}

resource "aws_lambda_permission" "api_gw_connect" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.connect.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_websocket.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "connect" {
  name = "/aws/lambda/${aws_lambda_function.connect.function_name}"

  retention_in_days = 30
}

# Disconnect lambda
resource "aws_lambda_function" "disconnect" {
  function_name = "Disconnect"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "disconnect.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "disconnect" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id_websocket

  integration_uri    = aws_lambda_function.disconnect.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "disconnect" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_websocket.id

  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.disconnect.id}"
#   authorization_type = "REQUEST"
#   authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id_websocket
}

resource "aws_lambda_permission" "api_gw_disconnect" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.disconnect.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_websocket.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "disconnect" {
  name = "/aws/lambda/${aws_lambda_function.disconnect.function_name}"

  retention_in_days = 30
}

# Default lambda
resource "aws_lambda_function" "default" {
  function_name = "Default"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "default.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "default" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id_websocket

  integration_uri    = aws_lambda_function.default.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "default" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_websocket.id

  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.default.id}"
#   authorization_type = "REQUEST"
#   authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id_websocket
}

resource "aws_lambda_permission" "api_gw_default" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.default.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_websocket.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "default" {
  name = "/aws/lambda/${aws_lambda_function.default.function_name}"

  retention_in_days = 30
}