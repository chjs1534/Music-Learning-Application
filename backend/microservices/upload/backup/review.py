import boto3
import json
import subprocess
# import librosa

BUCKET_NAME = "truly-entirely-hip-raccoon"

def handler(event, context):
    try:
        body = json.loads(event['body'])
        userId = body['userId']
        filename = body['filename']
        key = userId + '/' + filename
        video_path = f'/tmp/{userId}_{filename}'
        audio_path = f'/tmp/{userId}_{filename}.mp3'
        
        # download video from s3 and convert it to audio
        s3 = boto3.client('s3')
        s3.download_file(BUCKET_NAME, key, video_path)
        cmd = f'/var/task/ffmpeg -i {video_path} -q:a 0 -map a {audio_path}'
        subprocess.run(['/var/task/ffmpeg', '-i', video_path, '-q:a', '0', '-map', 'a', audio_path])

        
        
    except Exception as e:
        print(e)
        raise e
    
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "yes": "yes"
        })
    }