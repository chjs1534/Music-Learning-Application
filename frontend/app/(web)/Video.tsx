import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';
import NavBar from './NavBar';
import '../styles/website.css';

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

    const { id, fileId } = useParams();

    const modalRef = useRef<HTMLDivElement>(null);
    const ref = useRef(null);

    useEffect(() => {
        setUserType(localStorage.getItem('userType'))
        setAuthorId(localStorage.getItem('id'))
        getComments();
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
        }). then((json) => {
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

    const seek =  (time) => {
        player.replay()
        player.seekBy(time)
        console.log(time)
    }

    return (
        <div className="homepage">
            <div className="profile">
                <NavBar />
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
                    <p>{id}</p>
                    <VideoView
                        ref={ref}
                        player={player}
                        allowsFullscreen
                        allowsPictureInPicture
                        style={styles.video}
                    />

                    {reference ? <VideoView
                        ref={ref}
                        player={player2}
                        allowsFullscreen
                        allowsPictureInPicture
                        style={styles.video}
                    /> : <h3>Add a reference to get AI feedback</h3>}
                    
                </div>
                <div className="profile-extra">
                    <h3>Feedback</h3>
                    {reviews && (reviews.map((comment) => 
                        <div onClick={() => seek(comment.videoTime)} style={styles.div2}>
                            <p>{comment.videoTime}</p>
                            <p>{comment.commentText}</p>
                        </div>
                        
                    ))}
                </div>
                {userType === "Teacher" ? <button onClick={handleButton}>Add a review</button> : <p>not teahcer</p>}
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
        width: 400,
        height: 200,
        margin: 50,
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
