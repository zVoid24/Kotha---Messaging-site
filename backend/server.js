const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGO_URI } = require('./config');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const groupRoutes = require('./routes/group');
const Message = require('./models/Message');
const Group = require('./models/Group');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: 'http://localhost:3000' } });

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use(cors());
app.use(express.json());

// pass io to routes
app.use((req, res, next) => { req.io = io; next(); });

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// Socket.io
io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  // Join personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Send message (private or group)
 socket.on('sendMessage', async (msg) => {
  try {
    // Save message to DB
    const message = new Message(msg);
    const savedMsg = await message.save();

    if (msg.group) {
      // Group chat: broadcast to all members except sender
      const group = await Group.findById(msg.group);
      group.members.forEach(memberId => {
        if (memberId.toString() !== msg.sender) {
          io.to(memberId.toString()).emit('receiveMessage', savedMsg);
        }
      });
    } else if (msg.receiver) {
      // Private message: send to receiver
      io.to(msg.receiver).emit('receiveMessage', savedMsg);
    }

    // Send back to sender with saved message
    socket.emit('messageDelivered', savedMsg);
  } catch (err) {
    console.error('Error sending message:', err);
    socket.emit('messageError', { error: 'Failed to send message' });
  }
});

  // Mark messages as seen (private only)
  socket.on('markAsSeen', async ({ senderId, receiverId }) => {
    try {
      const result = await Message.updateMany(
        { sender: senderId, receiver: receiverId, seen: false },
        { $set: { seen: true } }
      );

      const eventData = { senderId, receiverId };
      io.to(senderId).emit('messagesSeen', eventData);
      io.to(receiverId).emit('messagesSeen', eventData);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

http.listen(5000, () => console.log('Server running on port 5000'));
