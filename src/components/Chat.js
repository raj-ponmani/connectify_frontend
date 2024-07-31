import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../api';
import AuthContext from '../AuthContext';
import './chat.css';

function Chat() {
  const api = useApi();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { accessToken, user } = useContext(AuthContext);
  const websocketRef = useRef(null);
  const [errors, setErrors] = useState({});


  const generateRoomName = (selectedUserId, currentUserId) => {
    const userIds = [selectedUserId, currentUserId];
    userIds.sort((a, b) => a - b);
    return userIds.join('');
  };

  const connectToRoom = useCallback(async (selectedUserId, currentUserId) => {
    const roomName = generateRoomName(selectedUserId, currentUserId);
    const websocketUrl = `ws://localhost:8000/ws/chat/${roomName}/`;
    websocketRef.current = new WebSocket(websocketUrl);

    websocketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    websocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Add message based on the sender and receiver
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: data.sender,
          receiver: data.receiver,
          message: data.message,
          timestamp: data.timestamp
        }
      ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    };

    websocketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Fetch existing messages for the selected user
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/api/messages/${selectedUserId}/`);
        console.log(response.data);
        setMessages(response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) || []);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };

    fetchMessages();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [api]);

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      if (accessToken && user) {
        try {
          const response = await api.get('/api/connected-users/');
          setConnectedUsers(response.data);
        } catch (error) {
          console.error('Failed to fetch connected users', error);
        }
      }
    };

    fetchConnectedUsers();
  }, [api, accessToken, user]);

  useEffect(() => {
    if (selectedUser) {
      connectToRoom(selectedUser.id, user.id);
    }
  }, [selectedUser, user, connectToRoom]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      sender: user.id,
      receiver: selectedUser.id,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    try {
      console.log('Sending message:', messageData);
      
      // Send message through WebSocket
      const response = await api.post(`/api/messages/${selectedUser.id}/`, messageData);

      if (websocketRef.current && response.status === 201) {
        websocketRef.current.send(JSON.stringify(messageData));
        setNewMessage('');
      }      
    } catch (error) {
      console.error('Failed to send message', error);
      setErrors({ message_error: 'Failed to send message' });
    }
  };

  return (
    <div className="connected-users-container">
        <div className="users-list">
            <h1>Connected Users</h1>
            {connectedUsers.length > 0 ? (
                <ul className='userListContainer'>
                    {connectedUsers.map(u => (
                        <li className='userList' key={u.id} onClick={() => {
                            setSelectedUser(u);
                        }}>
                            {u.username}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No connected users at the moment.</p>
            )}
            <div className="links">
                <Link to="/" className="link">Back to User Details</Link>
                <Link to="/requests" className="link">View Received Requests</Link>
            </div>
        </div>
        <div className="chat-box">
            {selectedUser ? (
                <div>
                    <h2>Chat with {selectedUser.username}</h2>
                    <div className="messages">
                        {messages.map((message, index) => (
                            <div key={index} className={message.sender === user.id ? 'message sent' : 'message received'}>
                                {message.message}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={sendMessage}>
                        <div className="new-message">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button type="submit">Send</button>
                        </div>
                        {errors.message_error && <span className="error">{errors.message_error}</span>}
                    </form>
                </div>
            ) : (
                <p>Select a user to start chatting.</p>
            )}
        </div>
    </div>
);

}

export default Chat;
