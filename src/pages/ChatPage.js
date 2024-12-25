import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function ChatPage({ userDetails }) {
    const [users, setUsers] = useState([]);
    const [receiverId, setReceiverId] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isChatVisible, setIsChatVisible] = useState(true);

    // Fetch users once on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/users');
                // Filter out the current user
                setUsers(response.data.filter((user) => user._id !== userDetails.userId));
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
    }, [userDetails.userId]);

    // Set up socket listener and cleanup
    useEffect(() => {
        const handleMessageReceived = (data) => {
            if (
                ((data.senderId === receiverId && data.receiverId === userDetails.userId) ||
                (data.senderId === userDetails.userId && data.receiverId === receiverId))
            ) {
                setMessages((prev) => [...prev, data]);
            }
        };

        // Avoid multiple listeners
        if (!socket.hasListeners('messageReceived')) {
            socket.on('messageReceived', handleMessageReceived);
        }

        return () => {
            socket.off('messageReceived', handleMessageReceived);
        };
    }, [receiverId, userDetails.userId]);

    // Fetch messages when receiver changes
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (receiverId) {
                    const response = await axios.get(
                        `http://localhost:5000/api/messages/${userDetails.userId}/${receiverId}`
                    );
                    setMessages(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        fetchMessages();
    }, [receiverId, userDetails.userId]);

    // Send message function
    const sendMessage = async () => {
        if (currentMessage.trim() === '') return;

        const messageData = {
            senderId: userDetails.userId,
            receiverId,
            message: currentMessage,
            timestamp: new Date().toISOString(),
        };

        try {
            await axios.post('http://localhost:5000/api/messages/send', messageData);
            socket.emit('sendMessage', messageData);
            setMessages((prev) => [...prev, messageData]);
            setCurrentMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const toggleChatVisibility = () => {
        setIsChatVisible(!isChatVisible);
    };

    // Group messages by date
    const groupMessagesByDate = () => {
        const groupedMessages = {};
        messages.forEach((msg) => {
            const date = new Date(msg.timestamp).toLocaleDateString();
            if (!groupedMessages[date]) {
                groupedMessages[date] = [];
            }
            groupedMessages[date].push(msg);
        });
        return groupedMessages;
    };

    const groupedMessages = groupMessagesByDate();

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Welcome, {userDetails.username}</h1>
            <div style={styles.chatContainer}>
                <div style={styles.userList}>
                    <h3>Users</h3>
                    <ul style={styles.userListItems}>
                        {users.map((user) => (
                            <li
                                key={user._id}
                                onClick={() => {
                                    setReceiverId(user._id);
                                    setIsChatVisible(true);
                                }}
                                onDoubleClick={toggleChatVisibility}
                                style={{
                                    ...styles.userItem,
                                    backgroundColor: receiverId === user._id ? '#d3e0ff' : '#ffffff',
                                }}
                            >
                                {user.username}
                            </li>
                        ))}
                    </ul>
                </div>
                {receiverId && (
                    <div style={styles.chatSection}>
                        <h3>Chat</h3>
                        {isChatVisible ? (
                            <div style={styles.messageContainer}>
                                {Object.entries(groupedMessages).map(([date, msgs], index) => (
                                    <div key={index} style={styles.messageGroup}>
                                        <div style={styles.dateHeader}>{date}</div>
                                        {msgs.map((msg, idx) => (
                                            <div key={idx} style={styles.message}>
                                                <span
                                                    style={{
                                                        ...styles.messageText,
                                                        textAlign:
                                                            msg.senderId === userDetails.userId
                                                                ? 'right'
                                                                : 'left',
                                                    }}
                                                >
                                                    {msg.message}
                                                </span>
                                                <span style={styles.timestamp}>
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        <div style={styles.inputContainer}>
                            <input
                                type="text"
                                placeholder="Type a message"
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                style={styles.input}
                            />
                            <button onClick={sendMessage} style={styles.sendButton}>
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        fontSize: '24px',
        marginBottom: '20px',
    },
    chatContainer: {
        display: 'flex',
        width: '80%',
        gap: '20px',
    },
    userList: {
        flex: 1,
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        height: '400px',
        overflowY: 'auto',
    },
    userListItems: {
        listStyleType: 'none',
        padding: 0,
    },
    userItem: {
        padding: '10px',
        marginBottom: '5px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    chatSection: {
        flex: 3,
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    messageContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
    },
    messageGroup: {
        marginBottom: '15px',
    },
    dateHeader: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '5px',
    },
    message: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '5px 0',
    },
    messageText: {
        flex: 1,
        padding: '8px',
        borderRadius: '5px',
        backgroundColor: '#e8f0fe',
        maxWidth: '80%',
    },
    timestamp: {
        fontSize: '12px',
        marginLeft: '10px',
        color: '#999',
    },
    inputContainer: {
        display: 'flex',
        gap: '10px',
    },
    input: {
        flex: 1,
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    sendButton: {
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default ChatPage;