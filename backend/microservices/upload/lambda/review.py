import boto3
import json
import subprocess
# import librosa

BUCKET_NAME = "truly-entirely-hip-raccoon"

def handler(event, context):

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "yes": "yeo"
        })
    }