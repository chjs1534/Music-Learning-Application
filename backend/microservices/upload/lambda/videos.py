import boto3
import json

BUCKET_NAME = "truly-entirely-hip-raccoon"

def handler(event, context):
    userId = event['queryStringParameters']['userId']
    client = boto3.client('s3')
    response = client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=f'{userId}/')

    video_names = [ content['Key'].split('/')[1] for content in response.get('Contents', []) ]

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "fileIds": list(set(video_names))
        })
    }