# Generate id
resource "random_pet" "testBucketName" {
  length = 4
}

# Generate s3 bucket
resource "aws_s3_bucket" "testBucket" {
  bucket = random_pet.testBucketName.id
}

# Configure s3 bucket
resource "aws_s3_bucket_ownership_controls" "testBucket" {
  bucket = aws_s3_bucket.testBucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "testBucket" {
  depends_on = [aws_s3_bucket_ownership_controls.testBucket]

  bucket = aws_s3_bucket.testBucket.id
  acl    = "private"
}

output "testBucket" {
  description = "Name of the S3 bucket used to store function code."

  value = aws_s3_bucket.testBucket.id
}

# Create zip file of lambda
data "archive_file" "testLambdas" {
  type = "zip"
  
  source_dir  = "${path.module}/test"
  output_path = "${path.module}/test.zip"
}

# Store lambda in s3
resource "aws_s3_object" "testObject" {
  bucket = aws_s3_bucket.testBucket.id

  key    = "test.zip"
  source = data.archive_file.testLambdas.output_path

  etag = filemd5(data.archive_file.testLambdas.output_path)
}

# Dynamodb table
resource "aws_dynamodb_table" "testTable" {
  name         = "testTable"
  billing_mode = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key     = "testId"

  attribute {
    name = "testId"
    type = "S"
  }
}

# Policies and roles
resource "aws_iam_policy" "testDynamoDBLambdaPolicy" {
  name = "TestDynamoDBLambdaPolicy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = [
          aws_dynamodb_table.testTable.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role" "testLambdaExec" {
  name = "testLambdaRole"

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

resource "aws_iam_role_policy_attachment" "testLambdaPolicy" {
  for_each = {
    "AWSLambdaBasicExecutionRole": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "testDynamoDBLambdaPolicy": "${aws_iam_policy.testDynamoDBLambdaPolicy.arn}"
  }
  role       = aws_iam_role.testLambdaExec.name
  policy_arn = each.value
}

# Lambda function
resource "aws_lambda_function" "test" {
  function_name = "test"

  s3_bucket = aws_s3_bucket.testBucket.id
  s3_key    = aws_s3_object.testObject.key

  runtime = "nodejs16.x"
  handler = "test.handler"

  source_code_hash = data.archive_file.testLambdas.output_base64sha256

  role = aws_iam_role.testLambdaExec.arn

  timeout = 3
}

# Logging
resource "aws_cloudwatch_log_group" "test" {
  name = "/aws/lambda/${aws_lambda_function.test.function_name}"
  
  retention_in_days = 30
}

# Output lambda
output "testLambda" {
  value = aws_lambda_function.test
}
