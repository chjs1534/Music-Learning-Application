terraform {
  cloud {
    organization = "Mewsic"
    workspaces {
      name = "Mewsic-workspace-auth"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
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

# Cognito user pool
resource "aws_cognito_user_pool" "mewsic_user_pool" {
    name = "mewsicUserPool"

    # username_attributes = ["username"]
    auto_verified_attributes   = ["email"]

    password_policy {
        minimum_length    = 8
        require_lowercase = false
        require_numbers   = false
        require_symbols   = false
        require_uppercase = false
    }

    username_configuration {
        case_sensitive = true
    }

    verification_message_template {
        email_subject = "Mewsic Registration Verification Code"
        email_message = "Please use the following code to verify yourself on our app: {####}"
    }

    schema {
        name                     = "email"
        attribute_data_type      = "String"
        developer_only_attribute = false
        mutable                  = true
        required                 = false

        string_attribute_constraints {
            min_length = 3
            max_length = 256
        }
    }
    schema {
        name                     = "username"
        attribute_data_type      = "String"
        developer_only_attribute = false
        mutable                  = true
        required                 = false

        string_attribute_constraints {
            min_length = 3
            max_length = 256
        }
    }

    schema {
        name                     = "userType"
        attribute_data_type      = "String"
        developer_only_attribute = false
        mutable                  = true
        required                 = false

        string_attribute_constraints {
            min_length = 3
            max_length = 256
        }
    }

    schema {
        name                     = "firstName"
        attribute_data_type      = "String"
        developer_only_attribute = false
        mutable                  = true
        required                 = false

        string_attribute_constraints {
            min_length = 3
            max_length = 256
        }
    }

    schema {
        name                     = "lastName"
        attribute_data_type      = "String"
        developer_only_attribute = false
        mutable                  = true
        required                 = false

        string_attribute_constraints {
            min_length = 3
            max_length = 256
        }
    }
    
    lambda_config {
      pre_sign_up = aws_lambda_function.verify.arn // TODO: remove (only for testing)
      post_confirmation = data.terraform_remote_state.Mewsic-workspace-user.outputs.addUser.arn
    }
}

resource "aws_cognito_user_pool_client" "mewsic_user_pool_client" {
    name                         = "mewsicUserPoolClient"
    user_pool_id = aws_cognito_user_pool.mewsic_user_pool.id
    explicit_auth_flows          = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
}

output "userPool" {
    value = aws_cognito_user_pool.mewsic_user_pool
}

output "userPoolClient" {
    value = aws_cognito_user_pool_client.mewsic_user_pool_client
    sensitive = true
}

# Verify lambda
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
  output_path = "${path.module}/authLambdas.zip"
}

# Store lambdas zip in s3
resource "aws_s3_object" "lambdas" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "authLambdas.zip"
  source = data.archive_file.lambdas.output_path

  etag = filemd5(data.archive_file.lambdas.output_path)
}

# Policies and roles for lambdas
resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda_auth"

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

// For delete (Cognito)
resource "aws_iam_policy" "lambda_cognito_policy" {
  name   = "lambda_cognito_policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = "cognito-idp:AdminDeleteUser",
        Resource = aws_cognito_user_pool.mewsic_user_pool.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  for_each = {
    "AWSLambdaBasicExecutionRole": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "AWSLambdaCognitoRole": aws_iam_policy.lambda_cognito_policy.arn,
    "AWSDynamoDBPolicyUser": data.terraform_remote_state.Mewsic-workspace-user.outputs.lambda_dynamodb_policy_user.arn // delete from DynamoDB database
  }
  role       = aws_iam_role.lambda_exec.name
  policy_arn = each.value
}

# Lambda function
resource "aws_lambda_function" "verify" {
  function_name = "Verify"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs18.x"
  handler = "verify.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 5
}

# Permission for AWS cognito to invoke verify lambda TODO: get rid of this (for testing)
resource "aws_lambda_permission" "allow_execution_from_user_pool" {
  statement_id = "AllowExecutionFromUserPool"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.verify.function_name
  principal = "cognito-idp.amazonaws.com"
  source_arn = aws_cognito_user_pool.mewsic_user_pool.arn
}

resource "aws_cloudwatch_log_group" "verify" {
  name = "/aws/lambda/${aws_lambda_function.verify.function_name}"

  retention_in_days = 30
}

# Permission for AWS cognito to invoke addUser lambda
resource "aws_lambda_permission" "allow_execution_from_user_pool_addUser" {
  statement_id = "AllowExecutionFromUserPoolAddUser"
  action = "lambda:InvokeFunction"
  function_name = data.terraform_remote_state.Mewsic-workspace-user.outputs.addUser.function_name
  principal = "cognito-idp.amazonaws.com"
  source_arn = aws_cognito_user_pool.mewsic_user_pool.arn
}

# Delete user lambda
resource "aws_lambda_function" "deleteUser" {
  function_name = "DeleteUser"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambdas.key

  runtime = "nodejs16.x"
  handler = "deleteUser.handler"

  source_code_hash = data.archive_file.lambdas.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 10

  environment {
    variables = {
      USERPOOL_ID = aws_cognito_user_pool.mewsic_user_pool.id
    }
  }
}

resource "aws_apigatewayv2_integration" "deleteUser" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.deleteUser.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "deleteUser" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "DELETE /user/deleteUser/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.deleteUser.id}"
  authorization_type = "JWT"
  authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

resource "aws_lambda_permission" "api_gw_deleteUser" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.deleteUser.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "deleteUser" {
  name = "/aws/lambda/${aws_lambda_function.deleteUser.function_name}"

  retention_in_days = 30
}

