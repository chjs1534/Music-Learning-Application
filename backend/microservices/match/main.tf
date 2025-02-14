terraform {
  cloud {
    organization = "Mewsic"
    workspaces {
      name = "Mewsic-workspace-match"
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

# Access outputs from user workspace
data "terraform_remote_state" "Mewsic-workspace-user" {
  backend = "remote"
  config = {
    organization = "Mewsic"
    workspaces = {
      name = "Mewsic-workspace-user"
    }
  }
}

# Match table
resource "aws_dynamodb_table" "match-table" {
  name           = "MatchTable"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "userId1"
  range_key      = "userId2"

  attribute {
    name = "userId1"
    type = "S"
  }

  attribute {
    name = "userId2"
    type = "S"
  }

  global_secondary_index {
    name               = "UserId2Index"
    hash_key           = "userId2"
    range_key          = "userId1"
    write_capacity     = 1
    read_capacity      = 1
    projection_type    = "ALL"
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
  output_path = "${path.module}/matchLambdas.zip"
}

# Store lambdas zip in s3
resource "aws_s3_object" "lambdas" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "matchLambdas.zip"
  source = data.archive_file.lambdas.output_path

  etag = filemd5(data.archive_file.lambdas.output_path)
}

# Policies and roles for lambdas
resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda_match"

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

resource "aws_iam_policy" "lambda_dynamodb_policy_match" {
  name = "lambda_dynamodb_policy_match"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ],
        Resource = [
          aws_dynamodb_table.match-table.arn,
          "${aws_dynamodb_table.match-table.arn}/index/UserId2Index"
        ],
      },
    ],
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  for_each = {
    "AWSLambdaBasicExecutionRole": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "AWSDynamodbRole": aws_iam_policy.lambda_dynamodb_policy_match.arn,
    "AWSInvokeLambdaRole": aws_iam_policy.invoke_lambda_policy_match.arn
  }
  role       = aws_iam_role.lambda_exec.name
  policy_arn = each.value
}

# Lambda functions
# Add match lambda
resource "aws_lambda_function" "addMatch" {
  function_name = "AddMatch"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "addMatch.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "addMatch" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.addMatch.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "addMatch" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "POST /match/addMatch"
  target    = "integrations/${aws_apigatewayv2_integration.addMatch.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_addMatch" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.addMatch.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "addMatch" {
  name = "/aws/lambda/${aws_lambda_function.addMatch.function_name}"

  retention_in_days = 30
}

# Get matches lambda
resource "aws_lambda_function" "getMatches" {
  function_name = "GetMatches"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "getMatches.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "getMatches" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.getMatches.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "getMatches" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "GET /match/getMatches/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.getMatches.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_getMatches" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getMatches.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "getMatches" {
  name = "/aws/lambda/${aws_lambda_function.getMatches.function_name}"

  retention_in_days = 30
}

# Add request lambda
resource "aws_lambda_function" "addRequest" {
  function_name = "AddRequest"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "addRequest.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "addRequest" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.addRequest.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "addRequest" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "POST /match/addRequest"
  target    = "integrations/${aws_apigatewayv2_integration.addRequest.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_addRequest" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.addRequest.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "addRequest" {
  name = "/aws/lambda/${aws_lambda_function.addRequest.function_name}"

  retention_in_days = 30
}

# Get matches lambda
resource "aws_lambda_function" "getRequests" {
  function_name = "GetRequests"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "getRequests.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "getRequests" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.getRequests.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "getRequests" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "GET /match/getRequests/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.getRequests.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_getRequests" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getRequests.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "getRequests" {
  name = "/aws/lambda/${aws_lambda_function.getRequests.function_name}"

  retention_in_days = 30
}

# Remove match lambda
resource "aws_lambda_function" "removeMatch" {
  function_name = "RemoveMatch"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "removeMatch.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "removeMatch" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.removeMatch.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "removeMatch" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "DELETE /match/removeMatch"
  target    = "integrations/${aws_apigatewayv2_integration.removeMatch.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_removeMatch" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.removeMatch.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "removeMatch" {
  name = "/aws/lambda/${aws_lambda_function.removeMatch.function_name}"

  retention_in_days = 30
}

# Get matches for messaging lambda
resource "aws_lambda_function" "getMatchesForMessaging" {
  function_name = "GetMatchesForMessaging"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "getMatchesForMessaging.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "getMatchesForMessaging" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.getMatchesForMessaging.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "getMatchesForMessaging" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "GET /match/getMatchesForMessaging/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.getMatchesForMessaging.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_getMatchesForMessaging" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getMatchesForMessaging.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "getMatchesForMessaging" {
  name = "/aws/lambda/${aws_lambda_function.getMatchesForMessaging.function_name}"

  retention_in_days = 30
}

// Allow 
resource "aws_iam_policy" "invoke_lambda_policy_match" {
  name        = "InvokeLambdaPolicyMatch"
  description = "Policy to allow invoking another Lambda function"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "lambda:InvokeFunction"
        ]
        Effect   = "Allow"
        Resource = [
          data.terraform_remote_state.Mewsic-workspace-user.outputs.lambdaGetUser.arn,
          data.terraform_remote_state.Mewsic-workspace-user.outputs.lambdaGetFamily.arn,
          aws_lambda_function.getMatches.arn
        ]
      }
    ]
  })
}


# Output
output "lambda_dynamodb_policy_match" {
  value = aws_iam_policy.lambda_dynamodb_policy_match
}