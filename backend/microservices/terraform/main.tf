output "module_path" {
  value = path.module
}

terraform {
  cloud {
    organization = "Mewsic"
    workspaces {
      name = "Mewsic-workspace"
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
# TODO: add the keys
provider "aws" {
  region = "ap-southeast-2"
}

# Generate id
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

output "lambda_bucket_name" {
  description = "Name of the S3 bucket used to store function code."

  value = aws_s3_bucket.lambda_bucket.id
}

# Create zip file of lambda
data "archive_file" "lambda_hello_world" {
  type = "zip"
  
  source_dir  = "${path.module}/User"
  output_path = "${path.module}/User.zip"
}

# Store lambda in s3
resource "aws_s3_object" "lambda_hello_world" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "User.zip"
  source = data.archive_file.lambda_hello_world.output_path

  etag = filemd5(data.archive_file.lambda_hello_world.output_path)
}

# Dynamodb table
resource "aws_dynamodb_table" "userTable" {
  name         = "Mewsic_User_Table"
  billing_mode = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}

# Policies and roles
resource "aws_iam_policy" "dynamoDBLambdaPolicy" {
  name = "DynamoDBLambdaPolicy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = [
          aws_dynamodb_table.userTable.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

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
    "AWSLambdaBasicExecutionRole": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "dynamoDBLambdaPolicy": "${aws_iam_policy.dynamoDBLambdaPolicy.arn}"
  }
  role       = aws_iam_role.lambda_exec.name
  policy_arn = each.value
}

# Lambda function
resource "aws_lambda_function" "hello_world" {
  function_name = "HelloWorld"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_hello_world.key

  runtime = "nodejs16.x"
  handler = "lambda.handler"

  source_code_hash = data.archive_file.lambda_hello_world.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 5
}

resource "aws_cloudwatch_log_group" "hello_world" {
  name = "/aws/lambda/${aws_lambda_function.hello_world.function_name}"
  
  retention_in_days = 30
}

# Output lambda
output "helloLambda" {
  description = "Name of the Lambda function."

  value = aws_lambda_function.hello_world
}
