import React, { useState, useRef, useEffect } from 'react';
import NavBar from './NavBar';
import '../styles/website.css';

interface Friend {
  id: string;
  name: string;
  profilePic: string;
  messages: Message[];
}

interface Message {
  sender: string;
  content: string;
  type: 'text' | 'image' | 'file';
  time: string;
}

const friendsData: Friend[] = [];

const MessageScreen = () => {
  const WEBSOCKET_API = 'wss://xeoe7fp8z0.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage_websocket/'

  const [friends, setFriends] = useState<Friend[]>(friendsData);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const selectedFriend = friends.find(friend => friend.id === selectedFriendId);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setUserId(localStorage.getItem('id'));
    getFriendIDs();
    console.log(userId, token)
  }, [token, userId]);

  useEffect(() => {
    ws.current = new WebSocket(`${WEBSOCKET_API}?userId=${userId}`);
    ws.current.onopen = () => {
      console.log("connected");
    };

    ws.current.onmessage = (evt) => {
      try {
        const message = JSON.parse(evt.data);
        handleIncomingMessage(message);
      } catch {
        console.log('error in parsing');
      }
    };

    ws.current.onclose = () => {
      console.log("disconnected");
      // Example reconnection logic:
      setTimeout(() => {
        ws.current = new WebSocket(`${WEBSOCKET_API}?userId=${userId}`);
      }, 3000); // Reconnect after 5 seconds
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const getFriendIDs = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/getMatches/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
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

  const getFriendDetails = async (userId) => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
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
        console.log(data)
        setFriends(prevFriends => [
          ...prevFriends,
          {
            id: data.userId,
            name: data.firstName + data.lastName,
            profilePic: 'https://via.placeholder.com/50',
            messages: [
              { sender: 'Friend 4', content: 'Hey! New friend added!', type: 'text', time: '2:00 PM' },
            ],
          },
        ]);
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  const handleIncomingMessage = (message: Message) => {
    const friendId = message.sender === 'You' ? selectedFriendId : parseInt(message.sender);
    const updatedFriends = friends.map(friend =>
      friend.id === friendId
        ? { ...friend, messages: [...friend.messages, message] }
        : friend
    );
    setFriends(updatedFriends);
    setTimeout(scrollToBottom, 0);
  };

  const handleFriendClick = (id: string) => {
    setSelectedFriendId(id);
    setTimeout(scrollToBottom, 0);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() && !imageFile) return;

    let newMessage: Message = {
      sender: 'You',
      content: messageText,
      type: 'text',
      time: new Date().toLocaleTimeString(),
    };

    if (imageFile) {
      newMessage = {
        sender: 'You',
        content: URL.createObjectURL(imageFile),
        type: 'image',
        time: new Date().toLocaleTimeString(),
      };
    }

    // if (ws.current) {
    //   ws.current.send(JSON.stringify(newMessage));
    // }

    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(newMessage));
    } else {
      console.log('WebSocket not open to send message');
    }

    const updatedFriends = friends.map(friend =>
      friend.id === selectedFriendId
        ? { ...friend, messages: [...friend.messages, newMessage] }
        : friend
    );

    setFriends(updatedFriends);
    setMessageText('');
    setImageFile(null);
    setTimeout(scrollToBottom, 0); // Allow for re-render before scrolling
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
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
            <h2>Chats</h2>
            {friends.map(friend => (
              <div key={friend.id} className="friend" onClick={() => handleFriendClick(friend.id)}>
                <img src={friend.profilePic} alt="Profile" className="profile-pic" />
                <span className="friend-name">{friend.name}</span>
              </div>
            ))}
          </div>
          <div className="message-box">
            {selectedFriend && (
              <>
                <div className="user-container">
                  <img src={selectedFriend.profilePic} alt="Profile" className="profile-pic" />
                  <span className="username">{selectedFriend.name}</span>
                </div>
                <div className="message-container">
                  {selectedFriend.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message ${message.sender === 'You' ? 'user-message' : ''}`}
                      style={{ textAlign: message.sender === 'You' ? 'right' : 'left' }}
                    >
                      {message.sender !== 'You' && (
                        <img src={selectedFriend.profilePic} alt="Profile" className="profile-pic" />
                      )}
                      <div className="message-content">
                        <span className="message-sender">{message.sender}</span>
                        {message.type === 'text' ? (
                          <p className="message-text">{message.content}</p>
                        ) : (
                          <img src={message.content} alt="Sent" className="message-image" />
                        )}
                        <span className="message-time">{message.time}</span>
                      </div>
                      {message.sender === 'You' && (
                        <img src="https://via.placeholder.com/50/0000FF/808080?text=User" alt="Profile" className="profile-pic user-pic" />
                      )}
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
                    onKeyDown={handleKeyDown}
                  />
                  <button className="send-button" onClick={handleSendMessage}>Send</button>
                  <button className="emoji-button">😊</button>
                  <button className="file-button">📎</button>
                  <input
                    type="file"
                    className="image-input"
                    onChange={handleSendImage}
                    style={{ display: 'none' }}
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="image-button">🖼️</label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageScreen;