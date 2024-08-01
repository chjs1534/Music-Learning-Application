import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Image } from 'react-native';
import NavBar from './NavBar';
import '../styles/website.css';
import axios from "axios";

const VideoWeb: React.FC = () => {
    const [video, setVideo] = useState();
    const [reference, setReference] = useState();
    const [authorId, setAuthorId] = useState<string>();
    const [reviews, setReviews] = useState();
    const [userType, setUserType] = useState<string>();
    const [playbackStatus, setPlaybackStatus] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [commentText, setCommentText] = useState<string>();
    const [reset, setReset] = useState()
    const [sync, setSync] = useState()
    const [tempo, setTempo] = useState()
    const [chord, setChord] = useState()

    const { id, fileId } = useParams();

    const modalRef = useRef<HTMLDivElement>(null);
    const ref = useRef(null);

    useEffect(() => {
        setUserType(localStorage.getItem('userType'))
        setAuthorId(localStorage.getItem('id'))
        getComments();
        getGeneratedReview();
    }, [])

    useEffect(() => {
        getComments();
    }, [reset])

    const getVideo = async () => {
        const res = await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/download?userId=${id}&fileId=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const json = await res.json();
        setVideo(json.downloadVideoUrl);
    };

    const getReference = async () => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/download?userId=${id}&fileId=${fileId}&isRef`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((res) => {
            return res.json();
        }).then((json) => {
            setReference(json.downloadVideoUrl);
        }).catch((error) => {
            setReference(null)
        })
    };

    let player = useVideoPlayer(video, player => {
        player.loop = false;
    });

    let player2 = useVideoPlayer(reference, player2 => {
        player2.loop = false;
    });

    useEffect(() => {
        getVideo()
        player.replace(video)
    }, [player]);

    useEffect(() => {
        getReference()
        console.log("ref", reference)
        player2.replace(reference)
    }, [player2]);

    player.addListener('playingChange', () => {
        setPlaybackStatus(player.currentTime)
    });

    const getComments = async () => {
        const res = await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/comments?userId=${id}&fileId=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const json = await res.json();
        console.log(json)
        setReviews(json.comments);
    }

    const handleClick = () => {
        if (commentText) {
            player.pause();
            console.log(playbackStatus, commentText)
            addComment();
            setShowModal(false);
            setCommentText(null);
        }
        else {
            alert('Add contents to feedback')
            setShowModal(false)
        }
    }

    const addComment = async () => {
        console.log("hhihhi")
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/comment`, {
            method: 'POST',
            body: JSON.stringify({
                userId: id,
                fileId: fileId,
                authorId: authorId,
                videoTime: playbackStatus,
                commentText: commentText
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        player.play()
        setReset(null)
    }

    const handleCloseModal = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current === e.target) {
            player.play()
            setShowModal(false);
        }
    };

    const handleInputChange = (e) => {
        setCommentText(e.target.value)
    };

    const handleButton = () => {
        setShowModal(true)
        player.pause()
    }

    const seek = (time) => {
        player.replay()
        player.seekBy(time)
    }

    const seek2 = (time) => {
        player2.replay()
        player2.seekBy(time)
    }

    const getGeneratedReview = async () => {
        console.log(id, fileId)
        const res = await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/getReview?userId=${id}&fileId=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const json = await res.json();
        setSync(json.downloadSyncUrl)
        setTempo(json.downloadTempoUrl)
        setChord(json.chords)
    }

    const fetchTTS = async (text: string) => {
        try {
            const response = await axios.get(
                `https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/tts?text=${encodeURIComponent(
                    text
                )}`,
                {
                    responseType: "arraybuffer",
                }
            );
            const audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(response.data);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
        } catch (error) {
            console.error("Error fetching TTS:", error);
        }
    };

    return (
        <div className="homepage">
            <NavBar />
            <div className="profile">
                <div style={styles.container}>
                    {showModal && (
                        <div className="modal" ref={modalRef} onClick={handleCloseModal}>
                            <div className="modal-content">
                                <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                                Add comment
                                <div className="modal-accounts-div">
                                    <textarea rows="4" cols="50" onChange={handleInputChange} placeholder='Add a comment here'></textarea>
                                    <button onClick={handleClick}>Submit Feedback</button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', justifyContent: 'space-evenly' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ marginTop: 50, fontFamily: 'sans-serif', fontSize: '1.5rem', fontWeight: 600 }}>Your upload:</p>
                            <VideoView
                                ref={ref}
                                player={player}
                                allowsFullscreen
                                allowsPictureInPicture
                                style={styles.video}
                            />
                            <p style={{ marginTop: 50, fontFamily: 'sans-serif', fontSize: '1.5rem', fontWeight: 600 }}>Your reference:</p>
                            {reference ? <VideoView
                                ref={ref}
                                player={player2}
                                allowsFullscreen
                                allowsPictureInPicture
                                style={styles.video}
                            /> : <h3>Add a reference to get AI feedback</h3>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                            <Text style={{ fontFamily: 'sans-serif', fontSize: '1.25rem', fontWeight: 600 }}>Teacher Feedback:</Text>
                            <div style={{ overflow: 'scroll', height: '75vh', backgroundColor: '#eeeeee', border: '2px solid orange' }}>
                                {reviews && (reviews.map((comment) =>
                                    <div className="feedback-contents" style={{border: '1px solid black'}}>
                                        <div onClick={() => seek(comment.videoTime)} style={{ display: 'flex', flexDirection: 'column', width: 300, margin: 10 }}>
                                            <p style={{}}>Posted on: {comment.timestamp}</p>
                                            <p style={{ color: 'red', }}>At {Math.round(comment.videoTime)}s</p>
                                            <p style={{ flex: 1 }}>{comment.commentText}</p>
                                        </div>
                                        <button>
                                            <img style={{width:50}}src="https://cdn-icons-png.flaticon.com/128/6996/6996058.png" onClick={() => fetchTTS(comment.commentText)} />
                                        </button>
                                    </div>
                                ))}
                                {userType === "Teacher" ? <button style={{ margin: 10, fontFamily: 'sans-serif', fontWeight: 600 }} onClick={handleButton}>Add a review</button> : null}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', padding: 20, }}>
                            <Text style={{ fontFamily: 'sans-serif', fontSize: '1.25rem', fontWeight: 600 }}>Chords:</Text>
                            <div style={{ overflow: 'scroll', height: '75vh', backgroundColor: '#eeeeee', border: '2px solid orange', padding: 20 }} >
                                {chord && chord.map((chord) =>
                                    <TouchableOpacity key={chord.timestamp} className="mb-5" onPress={() => seek2(chord.timestamp)}>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Text>At {Math.round(chord.timestamp)}s you should play a </Text><Text style={{ fontWeight: 800, marginLeft: 2 }}>{chord.chordRef}</Text>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Text>Chord you played:</Text><Text style={{ fontWeight: 800, marginLeft: 2 }}>{chord.chordMatch}</Text>
                                        </div>

                                    </TouchableOpacity>
                                )}
                            </div>

                        </div>
                    </div>



                </div>


                {(sync && tempo && chord) &&
                    <>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'sans-serif' }}>Machine Generated Feedback</h1>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100vw', height: 500 }}>
                            <Image style={{ width: 800, height: 450, margin: 20 }} source={{ uri: sync }} alt="hello" />
                            <Image style={{ width: 700, height: 550, margin: 20 }} source={{ uri: tempo }} alt="hello" />
                        </div>
                    </>
                }
            </div>
        </div>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    video: {
        width: 600,
        height: 300,
        // marginTop: 50,
    },
    timeText: {
        marginTop: 20,
        fontSize: 16,
    },
    div2: {
        flexDirection: 'row'
    }
});

export default VideoWeb
