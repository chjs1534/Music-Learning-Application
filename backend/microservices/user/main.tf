terraform {
  cloud {
    organization = "Mewsic"
    workspaces {
      name = "Mewsic-workspace-user"
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

# User table
resource "aws_dynamodb_table" "user-table" {
  name           = "UserTable"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "userType"
    type = "S"
  }

  attribute {
    name = "username"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name               = "UserTypeIndex"
    hash_key           = "userType"
    range_key          = "userId"
    write_capacity     = 1
    read_capacity      = 1
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "UsernameIndex"
    hash_key           = "username"
    write_capacity     = 1
    read_capacity      = 1
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "EmailIndex"
    hash_key           = "email"
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
  output_path = "${path.module}/userLambdas.zip"
}

# Store lambdas zip in s3
resource "aws_s3_object" "lambdas" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "userLambdas.zip"
  source = data.archive_file.lambdas.output_path

  etag = filemd5(data.archive_file.lambdas.output_path)
}

# Policies and roles for lambdas
resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda_user"

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

resource "aws_iam_policy" "lambda_dynamodb_policy_user" {
  name = "lambda_dynamodb_policy_user"
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
          aws_dynamodb_table.user-table.arn,
          "${aws_dynamodb_table.user-table.arn}/index/UserTypeIndex",
          "${aws_dynamodb_table.user-table.arn}/index/UsernameIndex",
          "${aws_dynamodb_table.user-table.arn}/index/EmailIndex"
        ],
      },
    ],
  })
}

# Policy for s3
resource "aws_iam_policy" "lambda_s3_policy_pfp" {
  name = "lambda_s3_policy_pfp"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:*",
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
        ],
        Resource = [
          "arn:aws:s3:::*",
          "arn:aws:s3:::${aws_s3_bucket.pfp_storage.id}",
          "arn:aws:s3:::${aws_s3_bucket.pfp_storage.id}/*",
        ],
      },
    ],
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  for_each = {
    "AWSLambdaBasicExecutionRole": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "AWSDynamodbRole": aws_iam_policy.lambda_dynamodb_policy_user.arn,
    "AWSS3Role": aws_iam_policy.lambda_s3_policy_pfp.arn
  }
  role       = aws_iam_role.lambda_exec.name
  policy_arn = each.value
}

# S3 bucket for pfp storage
# Generate s3 bucket name
resource "random_pet" "pfp_bucket_name" {
  length = 4
}

# Generate s3 bucket
resource "aws_s3_bucket" "pfp_storage" {
  bucket = random_pet.pfp_bucket_name.id
}

resource "aws_s3_bucket_ownership_controls" "pfp_storage" {
  bucket = aws_s3_bucket.pfp_storage.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "pfp_storage" {
  depends_on = [aws_s3_bucket_ownership_controls.pfp_storage]

  bucket = aws_s3_bucket.pfp_storage.id
  acl    = "private"
}

output "pfp_storage_name" {
  description = "Name of the S3 bucket used to store function code."

  value = aws_s3_bucket.pfp_storage.id
}

# Lambda functions
# Add user lambda
resource "aws_lambda_function" "addUser" {
  function_name = "AddUser"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "addUser.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10

  environment {
    variables = {
      PFP_STORAGE_BUCKET = aws_s3_bucket.pfp_storage.bucket
    }
  }
}

resource "aws_apigatewayv2_integration" "addUser" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.addUser.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "addUser" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "POST /user/addUser"
  target    = "integrations/${aws_apigatewayv2_integration.addUser.id}"
}

resource "aws_lambda_permission" "api_gw_addUser" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.addUser.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "addUser" {
  name = "/aws/lambda/${aws_lambda_function.addUser.function_name}"

  retention_in_days = 30
}

# Get user lambda
resource "aws_lambda_function" "getUser" {
  function_name = "GetUser"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "getUser.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "getUser" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.getUser.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "getUser" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "GET /user/getUser/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.getUser.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_getUser" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getUser.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "getUser" {
  name = "/aws/lambda/${aws_lambda_function.getUser.function_name}"

  retention_in_days = 30
}

# Get users by type lambda
resource "aws_lambda_function" "getUsersByType" {
  function_name = "GetUsersByType"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "getUsersByType.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "getUsersByType" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.getUsersByType.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "getUsersByType" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "GET /user/getUsersByType/{userType}"
  target    = "integrations/${aws_apigatewayv2_integration.getUsersByType.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_getUsersByType" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getUsersByType.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "getUsersByType" {
  name = "/aws/lambda/${aws_lambda_function.getUsersByType.function_name}"

  retention_in_days = 30
}

# Get userid lambda
resource "aws_lambda_function" "getUserId" {
  function_name = "GetUserId"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "getUserId.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "getUserId" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.getUserId.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "getUserId" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "GET /user/getUserId/{username}"
  target    = "integrations/${aws_apigatewayv2_integration.getUserId.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_getUserId" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getUserId.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "getUserId" {
  name = "/aws/lambda/${aws_lambda_function.getUserId.function_name}"

  retention_in_days = 30
}

# Get family lambda
resource "aws_lambda_function" "getFamily" {
  function_name = "GetFamily"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "getFamily.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "getFamily" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.getFamily.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "getFamily" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "GET /user/getFamily/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.getFamily.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_getFamily" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getFamily.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "getFamily" {
  name = "/aws/lambda/${aws_lambda_function.getFamily.function_name}"

  retention_in_days = 30
}

# Update user lambda
resource "aws_lambda_function" "updateUser" {
  function_name = "UpdateUser"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "updateUser.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10
}

resource "aws_apigatewayv2_integration" "updateUser" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.updateUser.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "updateUser" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "PUT /user/updateUser"
  target    = "integrations/${aws_apigatewayv2_integration.updateUser.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_updateUser" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.updateUser.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "updateUser" {
  name = "/aws/lambda/${aws_lambda_function.updateUser.function_name}"

  retention_in_days = 30
}

output "addUser" {
  value = aws_lambda_function.addUser
}

output "lambda_dynamodb_policy_user" {
  value = aws_iam_policy.lambda_dynamodb_policy_user
}