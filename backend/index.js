const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
const mongoUri = process.env.MONGO_URI;

// MongoDB Connection
mongoose
    .connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error(err));

// Socket.io for Real-Time Messaging
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('sendMessage', (data) => {
        io.emit('messageReceived', data); // Broadcast the message
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});