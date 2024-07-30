import React, { useEffect, useRef, useState } from 'react';
import NavBar from './NavBar';
import '../styles/messageStyles.css';

const WEBSOCKET_API = 'wss://ssj8wlu7j0.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage_websocket/';

interface Friend {
  id: string;
  name: string;
  profilePic: string;
  messages: Message[];
}

interface Message {
  senderId: string;
  receiverId: String;
  content: string;
  type: 'text';
  time: string;
}

const MessageComponent: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([
    // {
    //   id: 'default_friend_id',
    //   name: 'John Doe',
    //   profilePic: 'https://via.placeholder.com/50',
    //   messages: [
    //     {
    //       senderId: 'default_friend_id',
    //       content: 'Hello! How are you?',
    //       type: 'text',
    //       time: new Date().toISOString(),
    //     },
    //     {
    //       senderId: 'your_user_id',
    //       content: 'I am good, thank you!',
    //       type: 'text',
    //       time: new Date().toISOString(),
    //     },
    //   ],
    // },
  ]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>();
  const [messageText, setMessageText] = useState<string>('');
  const [sharedMessages, setSharedMessages] = useState<Message[]>([]);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // const [setselectedFriendId, setsetSelectedFriendId] = useState<string | null>();

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    getFriendIDs()
  }, [userId, token])

  useEffect(() => {
    handleIncomingMessage(sharedMessages);
  }, [sharedMessages])

  useEffect(() => {
    getMessages();
    console.log("call me babby", selectedFriendId)
  }, [selectedFriendId])

  const setFriendId = async (id) => {
    setSelectedFriendId(id);
  };

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setUserId(localStorage.getItem('id'));

    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode === 'enabled') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }

    if (userId) {
      ws.current = new WebSocket(`${WEBSOCKET_API}`);

      ws.current.onopen = () => {
        console.log("connected");
      };

      ws.current.onmessage = (evt) => {
        try {
          const message = JSON.parse(evt.data);
          console.log(message);
            getMessages();
        } catch {
          console.log('error in parsing');
        }
      };

      ws.current.onclose = () => {
        console.log("disconnected");
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [token, userId, selectedFriendId]);

  const getMessages = async () => {
    console.log(userId, selectedFriendId)
    if (selectedFriendId) {
      await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/messaging/getMessages/${userId}/${selectedFriendId}`, {
        method: 'GET',
        headers: {
          // 'Authorization': token,
          'Content-Type': 'application/json'
        },
      }).then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text) });
        }
        else {
          console.log(response);
        }
        return response.json();
      }).then(data => {
        console.log(data.messages, friends);
        setSharedMessages(data.messages);
      })
        .catch(error => {
          console.error('Error:', error.message, error.code || error);
        });
    }
  }

  const handleIncomingMessage = async (sharedMessages) => {
    if (sharedMessages && sharedMessages.length > 0) {
      const messageList = [];
      sharedMessages.forEach(message => {
        const newMessage: Message = {
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.msg,
          type: 'text',
          time: message.time,
        };
        messageList.push(newMessage)
      });
      const senderID = messageList[0].senderId;
      const receiverID = messageList[0].receiverId;
      setFriends(prevFriends =>
        prevFriends.map(friend =>
          (friend.id === senderID && userId === receiverID) ||
            (friend.id === receiverID && userId === senderID)
            ? {
              ...friend,
              messages: messageList,
            }
            : friend
        )
      );
      setMessageText('');
      setTimeout(scrollToBottom, 0);
    }
  };

  const getFriendIDs = async () => {
    if (!userId) return;
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/getMatchesForMessaging/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': token!,
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(data => {
        for (let i = 0; i < data.matches.length; i++) {
          getFriendDetails(data.matches[i].userId)
        }
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  const getFriendDetails = async (friendId: string) => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${friendId}`, {
      method: 'GET',
      headers: {
        'Authorization': token!,
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(data => {
        setFriends(prevFriends => [
          ...prevFriends,
          {
            id: data.userId,
            name: data.firstName + ' ' + data.lastName,
            profilePic: 'https://via.placeholder.com/50',
            messages: [],
          },
        ]);
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && selectedFriendId) {
      const message = {
        action: 'sendMessage',
        senderId: userId,
        msg: messageText,
        receiverId: selectedFriendId
      };

      ws.current.send(JSON.stringify(message));
    } else {
      console.log('WebSocket not open or no friend selected to send message');
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="homepage">
      <div className="messages">
        <NavBar />
        <div className="message-screen">
          <div className="friend-list">
            <h2>Friends</h2>
            {friends.map(friend => (
              <div key={friend.id} className="friend" onClick={() => setFriendId(friend.id)}>
                <img src={friend.profilePic} alt="Profile" className="profile-pic" />
                <div className="friend-info">
                  <span className="friend-name">{friend.name}</span>
                  <span className="friend-id">{friend.id}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="message-box">
            {selectedFriendId && (
              <>
                <div className="user-container">
                  <img src={friends.find(friend => friend.id === selectedFriendId)?.profilePic} alt="Profile" className="profile-pic-large" />
                  <div className="user-info">
                    <span className="user-name">{friends.find(friend => friend.id === selectedFriendId)?.name}</span>
                    <span className="user-id">{selectedFriendId}</span>
                  </div>
                </div>
                <div className="message-container">
                  {friends.find(friend => friend.id === selectedFriendId)?.messages.map((message, index) => (
                    <div key={index} className={`message ${message.senderId === userId ? 'my-message' : 'their-message'}`}>
                      <img src={friends.find(friend => friend.id === (message.senderId === userId ? selectedFriendId : message.senderId))?.profilePic} alt="Profile" className="profile-pic" />
                      <div className="message-content">
                        <span className="message-sender">{message.senderId === userId ? 'You' : friends.find(friend => friend.id === message.senderId)?.name}</span>
                        <p className="message-text">{message.content}</p>
                        <span className="message-time">{new Date(message.time).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
                <div className="chat-container">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="message-input"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                  />
                  <button className="send-button" onClick={sendMessage}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;

