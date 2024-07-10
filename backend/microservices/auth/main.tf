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
}