import { StyleSheet, Text, View, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Agenda } from 'react-native-calendars';

const Calendar = ({ tasks, web, id, token }) => {

    const [items, setItems] = useState({});
    const [videoIds, setVideoIds] = useState();
    const [loading, setLoading] = useState(true);
    const [thumbnails, setThumbnails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [teacherId, setTeacherId] = useState();
    const [taskId, setTaskId] = useState();

    useEffect(() => {
        if (tasks && Array.isArray(tasks.tasks)) {
            const newItems = {};

            tasks.tasks.forEach((task) => {
                const teacherId = task.teacherId;
                if (Array.isArray(task.tasks)) {
                    task.tasks.forEach((item) => {
                        const date = formatDate(new Date(item.dueDate));
                        if (!newItems[date]) {
                            newItems[date] = [];
                        }
                        newItems[date].push({
                            name: item.text,
                            title: item.title,
                            taskId: item.id,
                            filename: item.filename,
                            teacherId: teacherId,
                            submitted: item.submitted
                        });
                    });
                }
            });
            setItems(newItems);
        }
    }, [tasks]);

    useEffect(() => {
        getVideos();
    }, []);

    const currentDate = new Date();
    const minDate = addDays(currentDate, -20);
    const maxDate = addDays(currentDate, 20);

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    const downloadFile = async (teacherId, taskId, filename) => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/task/download?studentId=${id}&taskId=${taskId}&filename=${filename}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
        }).then(response => {
            return response.json();
        }).then((json) => {
            window.open(json.downloadUrl)
        }).catch(error => {
            console.error('Error:', error.message, error.code || error);
        });
    }

    const getVideos = async () => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/videos?userId=${id}`, {
            method: 'GET',
            headers: {
                'Authorization': token as string,
                'Content-Type': 'application/json'
            },
        }).then(response => {
            return response.json();
        }).then(data => {
            if (data.fileIds.length === 0) {
                setVideoIds(null)
            } else {
                setVideoIds(data.fileIds)
            }
            setLoading(false);
        })
            .catch(error => {
                console.error('Error:', error.message, error.code || error);
            });
    }

    useEffect(() => {
        if (videoIds) {
            videoIds.map((videoId) => {
                getThumbnail(videoId)
            })
        }
    }, [videoIds])

    const getThumbnail = async (fileId) => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/download?userId=${id}&fileId=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(response => {
            return response.json();
        }).then(data => {
            setThumbnails(prevThumbnails => ({
                ...prevThumbnails,
                [fileId]: data.downloadThumbnailUrl,
            }));
        }).catch(error => {
            console.error('Error:', error.message, error.code || error);
        });
    }

    const submit = async (videoId) => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/task/submit`, {
            method: 'PUT',
            body: JSON.stringify({
                "studentId": id, 
                "teacherId": teacherId, 
                "taskId": taskId, 
                "submissionLink": `http://localhost:8081/video/${id}/${videoId}`, 
                "submissionText": "lmao"
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(response => {
            return response.json();
        }).then(data => {
            console.log(data)
        }).catch(error => {
            console.error('Error:', error.message, error.code || error);
        });
        setShowModal(false)
    };

    const setStates = (teacherId, taskId) => {
        setTaskId(taskId)
        setTeacherId(teacherId)
        setShowModal(true)
    }

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                    setShowModal(!showModal);
                }}
            >
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.modalView}>
                        <Text>Select video to submit</Text>
                        {Object.keys(thumbnails).length > 0 && Object.entries(thumbnails).map(([id, thumbnail]) => (
                            <TouchableOpacity key={id} style={styles.thumbnail} onPress={() => submit(id)}>
                                <Image style={{ width: 150, height: 150 }} source={{ uri: thumbnail }} alt="hello" />
                            </TouchableOpacity>)
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowModal(!showModal)}
                        >
                            <Text>Back</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
            <Agenda
                items={items}
                selected={formatDate(currentDate)}
                minDate={formatDate(minDate)}
                maxDate={formatDate(maxDate)}
                pastScrollRange={3}
                futureScrollRange={3}
                renderItem={(item, firstItemInDay) => {
                    return (
                        <View style={item.submitted ? styles.itemContainer2 : styles.itemContainer}>
                            <View>
                                <Text style={styles.text}>Title: {item.title}</Text>
                                <Text style={styles.text}>Task: {item.name}</Text>

                            </View>
                            {!web && !item.submitted ?
                                <TouchableOpacity style={styles.button2} onPress={() => setStates(item.teacherId, item.taskId)}>
                                    <Text>Submit</Text>
                                </TouchableOpacity>
                                : null
                            }
                            {web && item.filename ?
                                <TouchableOpacity style={styles.button} onPress={() => downloadFile(item.teacherId, item.taskId, item.filename)}>
                                    <Text>Open attached file</Text>
                                </TouchableOpacity>
                                : null
                            }
                        </View>
                    );
                }}
                // renderDay={(day, item) => {
                //     return <View />;
                // }}
                renderEmptyData={() => {
                    return <View></View>;
                }}
                hideKnob={web ? true : false}
                showClosingKnob={web ? false : true}
                style={web ? { width: 900, height: 400, minHeight: 400 } : { width: 400, height: 400 }}
            />
        </>
    );
};

export default Calendar;

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: 'white',
        padding: 10,
        marginVertical: 40,
        marginHorizontal: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemContainer2: {
        backgroundColor: '#8bca84',
        padding: 10,
        marginVertical: 40,
        marginHorizontal: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    text: {
        overflow: 'hidden',
        flex: 1
    },
    button: {
        backgroundColor: '#89f7fe',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        elevation: 2,
    },
    button2: {
        alignItems: 'center',
        backgroundColor: '#89f7fe',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 10,
    }, modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%', 
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '50%', 
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }, textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    thumbnail: {
        padding: 10
    },
    closeButton: {
        backgroundColor: '#89f7fe',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        elevation: 2,
        marginBottom: 30,
        alignItems: 'center',
      },
});
