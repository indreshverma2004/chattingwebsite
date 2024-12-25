const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// Send Message
router.post('/send', async (req, res) => {
    const { senderId, receiverId, message } = req.body;

    try {
        const newMessage = new Message({ senderId, receiverId, message });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get Messages Between Two Users
router.get('/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;