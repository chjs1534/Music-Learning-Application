output "module_path" {
  value = path.module
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

# S3 bucket for video storage
resource "random_pet" "video_bucket_name" {
  length = 4
}

resource "aws_s3_bucket" "video_storage" {
  bucket = random_pet.video_bucket_name.id
}

resource "aws_s3_bucket_ownership_controls" "video_storage" {
  bucket = aws_s3_bucket.video_storage.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "video_storage" {
  depends_on = [aws_s3_bucket_ownership_controls.video_storage]

  bucket = aws_s3_bucket.video_storage.id
  acl    = "private"
}

output "video_storage_name" {
  description = "Name of the S3 bucket used to store function code."

  value = aws_s3_bucket.video_storage.id
}

# Create zip file of lambda
data "archive_file" "lambda_upload" {
  type = "zip"
  
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/lambda.zip"
}

# Store lambda in s3
resource "aws_s3_object" "lambda_upload" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "lambda.zip"
  source = data.archive_file.lambda_upload.output_path

  etag = filemd5(data.archive_file.lambda_upload.output_path)
}

# Policies and roles
resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda_upload"

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

# policy for s3, need to find correct actions
resource "aws_iam_policy" "lambda_s3_policy" {
  name = "lambda_s3_policy"
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
          "arn:aws:s3:::${aws_s3_bucket.video_storage.id}",
          "arn:aws:s3:::${aws_s3_bucket.video_storage.id}/*",
        ],
      },
    ],
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  for_each = {
    "AWSLambdaBasicExecutionRole": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "AWSS3Role": aws_iam_policy.lambda_s3_policy.arn
  }
  role       = aws_iam_role.lambda_exec.name
  policy_arn = each.value
}

# Lambda function
resource "aws_lambda_function" "upload" {
  function_name = "Upload"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_upload.key

  runtime = "nodejs18.x"
  handler = "upload.handler"

  source_code_hash = data.archive_file.lambda_upload.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 5
}

resource "aws_lambda_function" "download" {
  function_name = "Download"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_upload.key

  runtime = "nodejs18.x"
  handler = "download.handler"

  source_code_hash = data.archive_file.lambda_upload.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 5
}

resource "aws_cloudwatch_log_group" "upload" {
  name = "/aws/lambda/${aws_lambda_function.upload.function_name}"

  retention_in_days = 30
}

output "upload_lambda" {
  description = "Lambda function."

  value = aws_lambda_function.upload
}

output "download_lambda" {
  description = "Lambda function."

  value = aws_lambda_function.download
}
