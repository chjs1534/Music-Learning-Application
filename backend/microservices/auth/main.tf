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

output "vpc_id" {
  description = "The VPC ID"
  value = aws_vpc.my_vpc.id
}

# Cognito user pool
resource "aws_cognito_user_pool" "mewsic_user_pool" {
    name = "mewsicUserPool"

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

# Cognito user pool for mobile
resource "aws_cognito_user_pool" "mewsic_user_pool_mobile" {
    name = "mewsicUserPoolMobile"

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

    lambda_config {
        pre_authentication = aws_lambda_function.verify.arn
    }
}

resource "aws_cognito_user_pool_client" "mewsic_user_pool_client_mobile" {
    name                         = "mewsicUserPoolClientMobile"
    user_pool_id = aws_cognito_user_pool.mewsic_user_pool_mobile.id
    explicit_auth_flows          = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
}

output "userPoolMobile" {
    value = aws_cognito_user_pool.mewsic_user_pool_mobile
}

output "userPoolClientMobile" {
    value = aws_cognito_user_pool_client.mewsic_user_pool_client_mobile
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

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  for_each = {
    "AWSLambdaBasicExecutionRole": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
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

resource "aws_cloudwatch_log_group" "verify" {
  name = "/aws/lambda/${aws_lambda_function.verify.function_name}"

  retention_in_days = 30
}
