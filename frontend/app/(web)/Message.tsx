import React, { useState, useRef, useEffect } from 'react';
import NavBar from './NavBar';
import '../styles/website.css';

interface Friend {
  id: number;
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

const friendsData: Friend[] = [
  {
    id: 1,
    name: 'Friend 1',
    profilePic: 'https://via.placeholder.com/50',
    messages: [
      { sender: 'Friend 1', content: 'Hello! How are you?', type: 'text', time: '12:00 PM' },
    ],
  },
  {
    id: 2,
    name: 'Friend 2',
    profilePic: 'https://via.placeholder.com/50',
    messages: [
      { sender: 'Friend 2', content: 'Hey! Long time no see!', type: 'text', time: '1:00 PM' },
    ],
  },
];

const MessageScreen = () => {
  const [friends, setFriends] = useState<Friend[]>(friendsData);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const selectedFriend = friends.find(friend => friend.id === selectedFriendId);

  const handleFriendClick = (id: number) => {
    setSelectedFriendId(id);
    setTimeout(scrollToBottom, 0); // Allow for re-render before scrolling
  };

  const handleSendMessage = () => {
    if (!messageText.trim() && !imageFile) return;

    if (selectedFriend) {
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

      const updatedFriends = friends.map(friend =>
        friend.id === selectedFriendId
          ? { ...friend, messages: [...friend.messages, newMessage] }
          : friend
      );

      setFriends(updatedFriends);
      setMessageText('');
      setImageFile(null);
      setTimeout(scrollToBottom, 0); // Allow for re-render before scrolling
    }
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
