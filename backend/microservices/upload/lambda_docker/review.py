import boto3
import librosa
import subprocess
import numpy as np
import matplotlib.pyplot as plt
import json
import os
from chord_extractor.extractors import Chordino

BUCKET_NAME = "truly-entirely-hip-raccoon"

def convert_timestamp(timestamp_ref, wp_s):
    times_ref = wp_s[:, 0]
    times = wp_s[:, 1]
    closest_index = np.argmin(np.abs(times_ref - timestamp_ref))
    timestamp = times[closest_index]
    return timestamp

def handler(event, context):
    try:
        body = json.loads(event['body'])
        userId = body['userId']
        fileId = body['fileId']

        key = f'{userId}/{fileId}/upload.mp4'
        key_ref = f'{userId}/{fileId}/reference.mp4'

        video_path = f'/tmp/upload.mp4'
        audio_path = f'/tmp/upload.mp3'

        video_path_ref = f'/tmp/reference.mp4'
        audio_path_ref = f'/tmp/reference.mp3'
        
        if os.path.exists(video_path):
            os.remove(video_path)
        if os.path.exists(video_path_ref):
            os.remove(video_path_ref)

        # download video from s3 and convert it to audio
        s3 = boto3.client('s3')

        s3.download_file(BUCKET_NAME, key, video_path)
        cmd = f'/var/task/ffmpeg -i {video_path} -q:a 0 -map a {audio_path}'
        subprocess.run(['/var/task/ffmpeg', '-i', video_path, '-q:a', '0', '-map', 'a', audio_path])

        s3.download_file(BUCKET_NAME, key_ref, video_path_ref)
        cmd = f'/var/task/ffmpeg -i {video_path_ref} -q:a 0 -map a {audio_path_ref}'
        subprocess.run(['/var/task/ffmpeg', '-i', video_path_ref, '-q:a', '0', '-map', 'a', audio_path_ref])


        y, sr = librosa.load(audio_path)
        y_ref, sr_ref = librosa.load(audio_path_ref)

        # dynamic tempo and save plot to s3
        tempo_dynamic = librosa.feature.tempo(y=y, sr=sr_ref, aggregate=None, std_bpm=1, ac_size=20)
        tempo_dynamic_ref = librosa.feature.tempo(y=y_ref, sr=sr_ref, aggregate=None, std_bpm=1, ac_size=20)

        fig, ax = plt.subplots()
        times_ref = librosa.times_like(tempo_dynamic_ref, sr=sr_ref)
        times = librosa.times_like(tempo_dynamic, sr=sr)
        
        # smoothing for the plot
        from scipy.interpolate import make_interp_spline
        X_Y_Spline_ref = make_interp_spline(times_ref, tempo_dynamic_ref)
        X_Y_Spline = make_interp_spline(times, tempo_dynamic)
        X_ref = np.linspace(times_ref.min(), times_ref.max(), 500)
        Y_ref = X_Y_Spline_ref(X_ref)
        X_ = np.linspace(times.min(), times.max(), 500)
        Y_ = X_Y_Spline(X_)

        ax.plot(X_ref, Y_ref, label='Reference tempo estimate')
        ax.plot(X_, Y_, label='Your Upload tempo estimate')
        ax.legend()
        ax.set(xlabel='Time (s)', ylabel='Tempo (BPM)')
        plt.savefig('/tmp/tempo.png')
        s3.upload_file('/tmp/tempo.png', BUCKET_NAME, f'{userId}/{fileId}/tempo.png')

        # dtw syncing and save plot to s3
        Y = librosa.feature.chroma_cqt(y=y, sr=sr)
        X = librosa.feature.chroma_cqt(y=y_ref, sr=sr_ref)
        D, wp = librosa.sequence.dtw(X, Y)
        hop_length = 1024
        wp_s = librosa.frames_to_time(wp, sr=sr_ref, hop_length=hop_length)

        from matplotlib.patches import ConnectionPatch
        fig, (ax1, ax2) = plt.subplots(nrows=2, sharex=True, sharey=True, figsize=(8,4))

        librosa.display.waveshow(y, sr=sr, ax=ax2, axis='s')
        ax2.set(title='Your Upload')

        librosa.display.waveshow(y_ref, sr=sr_ref, ax=ax1, axis='s')
        ax1.set(title='Reference')
        ax1.label_outer()

        ax1.set_yticks([])
        ax2.set_yticks([])

        n_arrows = 20
        for tp1, tp2 in wp_s[::len(wp_s)//n_arrows]:
            # Create a connection patch between the aligned time points
            # in each subplot
            con = ConnectionPatch(xyA=(tp1, 0), xyB=(tp2, 0),
                                axesA=ax1, axesB=ax2,
                                coordsA='data', coordsB='data',
                                color='r', linestyle='--',
                                alpha=0.5)
            con.set_in_layout(False)  # This is needed to preserve layout
            ax2.add_artist(con)
        plt.savefig('/tmp/sync.png')
        s3.upload_file('/tmp/sync.png', BUCKET_NAME, f'{userId}/{fileId}/sync.png')

        # Compares chord closest in time to reference chord
        # whenever there is a chord change.
        # uses dtw syncing to match up times

        chordino = Chordino(roll_on=1)
        chords = [chordino.extract(audio_path), chordino.extract(audio_path_ref)]

        review = []
        for chord_change_ref in chords[1]:
            chord = chord_change_ref[0]
            ref_timestamp = chord_change_ref[1]
            timestamp = convert_timestamp(ref_timestamp, wp_s)
            nearest = '-'
            min_dist = 5
            for chord_change in chords[0]:
                dist = abs(timestamp - chord_change[1] + 1.5)
                if dist < 2 and dist < min_dist:
                    nearest = chord_change[0]
                    min_dist = dist
            review.append({'timestamp': str(round(ref_timestamp, 2)), 'chordRef': chord, 'chordMatch': nearest})

        # udpate review in table
        table = boto3.resource('dynamodb').Table('VideosTable')
        table.update_item(
            Key={'userId': userId, 'fileId': fileId},
            UpdateExpression='SET review = :r',
            ExpressionAttributeValues={
                ':r': review
            }
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "yes": "yeee"
            })
        }

    except Exception as e:
        print("error ", e)
        return {
            "statusCode": 420,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "no": "no"
            })
        }
        raise e
