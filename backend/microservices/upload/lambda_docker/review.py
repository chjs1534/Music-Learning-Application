import boto3
import librosa
import subprocess
import numpy as np
import matplotlib.pyplot as plt
import json
from chord_extractor.extractors import Chordino

BUCKET_NAME = "truly-entirely-hip-raccoon"

def convert_timestamp(timestamp_ref, wp_s):
    times_ref = wp_s[:, 0]
    times = wp_s[:, 1]
    closest_index = np.argmin(np.abs(times_ref - timestamp_ref))
    timestamp = times[closest_index]
    return timestamp

def handle(event, context):
    try:
        print('1')
        body = json.loads(event['body'])
        userId = body['userId']
        fileId = body['fileId']

        key = f'{userId}/{fileId}/upload.mp4'
        key_ref = f'{userId}/{fileId}/reference.mp4'

        video_path = f'/tmp/upload.mp4'
        audio_path = f'/tmp/upload.mp3'

        video_path_ref = f'/tmp/reference.mp4'
        audio_path_ref = f'/tmp/reference.mp3'
        
        # download video from s3 and convert it to audio
        s3 = boto3.client('s3')

        s3.download_file(BUCKET_NAME, key, video_path)
        cmd = f'/var/task/ffmpeg -i {video_path} -q:a 0 -map a {audio_path}'
        subprocess.run(['/var/task/ffmpeg', '-i', video_path, '-q:a', '0', '-map', 'a', audio_path], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)

        s3.download_file(BUCKET_NAME, key_ref, video_path_ref)
        cmd = f'/var/task/ffmpeg -i {video_path_ref} -q:a 0 -map a {audio_path_ref}'
        subprocess.run(['/var/task/ffmpeg', '-i', video_path_ref, '-q:a', '0', '-map', 'a', audio_path_ref], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)

        # extract audio from video
        # video_path = f'IMG-3754_2_Trim.mp4'
        # audio_path = f'audio.mp3'
        print('2')

        # subprocess.run(['ffmpeg', '-i', video_path, '-q:a', '0', '-map', 'a', audio_path])

        y, sr = librosa.load(audio_path)
        y_ref, sr_ref = librosa.load(audio_path_ref)
        
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        tempo_ref, beat_frames_ref = librosa.beat.beat_track(y=y_ref, sr=sr_ref)

        print("Tempo: ", tempo, tempo_ref)
        # print("Beat Frames: ", beat_frames, beat_frames_ref)
        #print("Beat diffs: ", [ beat_frames[i] - beat_frames_ref[i] for i in range(min(len(beat_frames), len(beat_frames_ref))) ])
        print('3')
        
        # dynamic tempo
        # useful for isolated instruments or drums
        tempo_dynamic = librosa.feature.tempo(y=y, sr=sr, aggregate=None, std_bpm=4, ac_size=8)
        tempo_dynamic_ref = librosa.feature.tempo(y=y_ref, sr=sr_ref, aggregate=None, std_bpm=4, ac_size=8)
        print('Tempos: ', tempo_dynamic, tempo_dynamic_ref)

        fig, ax = plt.subplots()
        times_ref = librosa.times_like(tempo_dynamic_ref, sr=sr_ref)
        times = librosa.times_like(tempo_dynamic, sr=sr)
        ax.plot(times_ref, tempo_dynamic_ref, label='Reference tempo estimate')
        ax.plot(times, tempo_dynamic, label='Cover tempo estimate')
        ax.legend()
        ax.set(xlabel='Time (s)', ylabel='Tempo (BPM)')
        plt.savefig('/tmp/tempo.png')
        s3.upload_file('/tmp/tempo.png', BUCKET_NAME, f'{userId}/{fileId}/tempo.png')


        # o_env = librosa.onset.onset_strength(y=y, sr=sr)
        # o_env_ref = librosa.onset.onset_strength(y=y_ref, sr=sr_ref)

        # times = librosa.times_like(o_env, sr=sr)

        # onset_frames = librosa.onset.onset_detect(onset_envelope=o_env, sr=sr)
        # onset_frames_ref = librosa.onset.onset_detect(onset_envelope=o_env_ref, sr=sr_ref)

        # onset_times = librosa.frames_to_time(onset_frames, sr=sr)
        # onset_times_ref = librosa.frames_to_time(onset_frames_ref, sr=sr_ref)
        # onset_diff = [onset_times[i] - onset_times_ref[i] for i in range(min(len(onset_times), len(onset_times_ref)))]

        # mean_diff = np.mean(np.abs(onset_diff))
        # max_diff = np.max(np.abs(onset_diff))
        # min_diff = np.min(np.abs(onset_diff))
        # print(f'mean: {mean_diff}, max: {max_diff}, min: {min_diff}')

        # dtw syncing
        Y = librosa.feature.chroma_cqt(y=y, sr=sr)
        X = librosa.feature.chroma_cqt(y=y_ref, sr=sr_ref)
        D, wp = librosa.sequence.dtw(X, Y)
        hop_length = 1024
        wp_s = librosa.frames_to_time(wp, sr=sr_ref, hop_length=hop_length)
        print("wps", wp_s)
        print(convert_timestamp(1, wp_s))
        print(convert_timestamp(140, wp_s))

        print('x')
        chordino = Chordino(roll_on=1)
        print('l')
        chords = chordino.extract_many([audio_path, audio_path_ref])
        print('d')

        # offset between first matching note
        # maybe get mean offet from ref to nearest note?
        offset = 0
        count = 0
        for chord_change_ref in chords[1][1]:
            chord = chord_change_ref[0]
            timestamp = chord_change_ref[1]
            if chord != 'N':
                same = [timestamp - c[1] for c in chords[0][1] if c[0] == chord]
                if same and abs(min(same, key=abs)) < 5:
                  offset += min(same, key=abs)
                  count += 1
        offset = offset / count
        print('offset', offset)

        # Compares chord closest in time to reference chord
        # whenever there is a chord change.
        # Works best when tempo matches 
        # e.g. short clips so timestamp offsets don't increase too much
        # limitation: rapid chord changes

        review = ''
        for chord_change_ref in chords[1][1]:
            chord = chord_change_ref[0]
            ref_timestamp = chord_change_ref[1]
            # print(f'old {ref_timestamp}')
            timestamp = convert_timestamp(ref_timestamp, wp_s)
            # print(timestamp)
            nearest = '-'
            min_dist = 5
            for chord_change in chords[0][1]:
                dist = abs(timestamp - chord_change[1] + 1.5)
                if dist < 2 and dist < min_dist:
                    nearest = chord_change[0]
                    min_dist = dist
            review += f'{round(ref_timestamp, 2)}: {chord} {nearest}' + '\n'
            # print(f'{round(ref_timestamp, 2)}: {chord} {nearest}')  
        print(review)

        # udpate review in table
        table = boto3.resource('dynamodb').Table('Reviews')
        table.update_item(
            Key={'UserId': userId, 'FileId': fileId},
            AttributeUpdates={
                'Review': review,
            },
        )

        from matplotlib.patches import ConnectionPatch
        fig, (ax1, ax2) = plt.subplots(nrows=2, sharex=True, sharey=True, figsize=(8,4))

        # Plot x_2
        librosa.display.waveshow(y, sr=sr, ax=ax2)
        ax2.set(title='cover')

        # Plot x_1
        librosa.display.waveshow(y_ref, sr=sr_ref, ax=ax1)
        ax1.set(title='reference')
        ax1.label_outer()

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
