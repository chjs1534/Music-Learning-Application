# Cognito user pool
resource "aws_cognito_user_pool" "mewsic_user_pool" {
    name = "mewsicUserPool"

    # alias_attributes           = ["email"]
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
}

# Lambda
# Generate id
resource "random_pet" "authBucket" {
  length = 4
}

# Generate s3 bucket
resource "aws_s3_bucket" "authBucket" {
  bucket = random_pet.authBucket.id
}

# Configure s3 bucket
resource "aws_s3_bucket_ownership_controls" "authBucket" {
  bucket = aws_s3_bucket.authBucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "authBucket" {
  depends_on = [aws_s3_bucket_ownership_controls.authBucket]

  bucket = aws_s3_bucket.authBucket.id
  acl    = "private"
}

# Create zip file of lambdas
data "archive_file" "authLambdas" {
  type = "zip"
  
  source_dir  = "${path.module}/auth"
  output_path = "${path.module}/auth.zip"
}

# Store zip in s3
resource "aws_s3_object" "authObject" {
  bucket = aws_s3_bucket.authBucket.id

  key    = "auth.zip"
  source = data.archive_file.authLambdas.output_path

  etag = filemd5(data.archive_file.authLambdas.output_path)
}

# Policy
resource "aws_iam_role" "authLambdaExec" {
  name = "authLambdaRole"

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

resource "aws_iam_role_policy_attachment" "authLambdaPolicy" {
  role       = aws_iam_role.authLambdaExec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Sign in function
resource "aws_lambda_function" "signIn" {
  function_name = "signIn"

  s3_bucket = aws_s3_bucket.authBucket.id
  s3_key    = aws_s3_object.authObject.key

  runtime = "nodejs16.x"
  handler = "signIn.handler"

  source_code_hash = data.archive_file.authLambdas.output_base64sha256

  role = aws_iam_role.authLambdaExec.arn

  timeout = 3
}

# Logging
resource "aws_cloudwatch_log_group" "signIn" {
  name = "/aws/lambda/${aws_lambda_function.signIn.function_name}"
  
  retention_in_days = 30
}

# Output lambda
output signInLambda {
    value = aws_lambda_function.signIn
}
