terraform {
  cloud {
    organization = "Mewsic"
    workspaces {
      name = "Mewsic-workspace-upload"
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
resource "aws_dynamodb_table" "review_table" {
  name           = "VideosTable"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "userId"
  range_key      = "fileId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "fileId"
    type = "S"
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = true
  }
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

resource "aws_s3_bucket_cors_configuration" "video_storage" {
  bucket = aws_s3_bucket.video_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
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

# dynamoDB policy
resource "aws_iam_policy" "lambda_dynamodb_policy_user" {
  name = "lambda_dynamodb_policy_user_review"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
        ],
        Resource = [
          aws_dynamodb_table.review_table.arn
        ],
      },
    ],
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
    "AWSS3Role": aws_iam_policy.lambda_s3_policy.arn,
    "AWSDynamoRole": aws_iam_policy.lambda_dynamodb_policy_user.arn,
    "AWSVPCRole": "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
    "AWSEFSRole": "arn:aws:iam::aws:policy/AmazonElasticFileSystemClientFullAccess",
    "AWSCloudwatch": "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess",
    "AWSPolly": "arn:aws:iam::aws:policy/AmazonPollyFullAccess"
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

resource "aws_lambda_function" "videos" {
  function_name = "Videos"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_upload.key

  runtime = "nodejs18.x"
  handler = "videos.handler"

  source_code_hash = data.archive_file.lambda_upload.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 5
}

resource "aws_lambda_function" "comment" {
  function_name = "Comment"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_upload.key

  runtime = "nodejs18.x"
  handler = "comment.handler"

  source_code_hash = data.archive_file.lambda_upload.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 5
}

resource "aws_lambda_function" "comments" {
  function_name = "Comments"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_upload.key

  runtime = "nodejs18.x"
  handler = "comments.handler"

  source_code_hash = data.archive_file.lambda_upload.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 5
}

resource "aws_lambda_function" "tts" {
  function_name = "TextToSpeech"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_upload.key

  runtime = "nodejs18.x"
  handler = "tts.handler"

  source_code_hash = data.archive_file.lambda_upload.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  timeout = 30
  # memory_size = 512
}


# API Gateway integration
# Integration of upload lambda
resource "aws_apigatewayv2_integration" "upload" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.upload.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "upload" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.id

  route_key = "POST /upload"
  target    = "integrations/${aws_apigatewayv2_integration.upload.id}"
  # authorization_type = "JWT"
  # authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

# Integration of download lambda
resource "aws_apigatewayv2_integration" "download" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.download.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "download" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  route_key = "GET /download"
  target    = "integrations/${aws_apigatewayv2_integration.download.id}"
  # authorization_type = "JWT"
  # authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

# Integration of videos lambda
resource "aws_apigatewayv2_integration" "videos" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.videos.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "videos" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  route_key = "GET /videos"
  target    = "integrations/${aws_apigatewayv2_integration.videos.id}"
  # authorization_type = "JWT"
  # authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

# Integration of comments lambda
resource "aws_apigatewayv2_integration" "comment" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.comment.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "comment" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  route_key = "POST /comment"
  target    = "integrations/${aws_apigatewayv2_integration.comment.id}"
  # authorization_type = "JWT"
  # authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

# Integration of getComments lambda
resource "aws_apigatewayv2_integration" "comments" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.comments.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "comments" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  route_key = "GET /comments"
  target    = "integrations/${aws_apigatewayv2_integration.comments.id}"
  # authorization_type = "JWT"
  # authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

# Integration of Text To Speech lambda
resource "aws_apigatewayv2_integration" "tts" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  integration_uri    = aws_lambda_function.tts.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "tts" {
  api_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api_id

  route_key = "GET /tts"
  target    = "integrations/${aws_apigatewayv2_integration.tts.id}"
  # authorization_type = "JWT"
  # authorizer_id = data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_gateway_auth_id
}

# Permission for upload lambda
resource "aws_lambda_permission" "api_gw_upload" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.upload.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

# Permission for download lambda
resource "aws_lambda_permission" "api_gw_download" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.download.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

# Permission for videos lambda
resource "aws_lambda_permission" "api_gw_videos" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.videos.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

# Permission for comment lambda
resource "aws_lambda_permission" "api_gw_comment" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.comment.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

# Permission for comment lambda
resource "aws_lambda_permission" "api_gw_comments" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.comments.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}

# Permission for Text To Speech lambda
resource "aws_lambda_permission" "api_gw_tts" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tts.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.terraform_remote_state.Mewsic-workspace-apigateway.outputs.mewsic_api.execution_arn}/*/*"
}