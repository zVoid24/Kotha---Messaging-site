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
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId); // personal room
    console.log(`User ${userId} joined room`);
  });

  socket.on('sendMessage', async (msg) => {
    try {
      const message = new Message(msg);
      const savedMsg = await message.save();

      // populate sender info for frontend
      const populatedMsg = await Message.findById(savedMsg._id)
        .populate('sender', 'username _id')
        .populate('receiver', 'username _id');

      if (msg.group) {
        // Group message: broadcast to all members
        const group = await Group.findById(msg.group).populate('members', '_id');
        group.members.forEach(member => {
          io.to(member._id.toString()).emit('receiveMessage', populatedMsg);
        });
      } else if (msg.receiver) {
        // Private message
        io.to(msg.receiver).emit('receiveMessage', populatedMsg);
      }

      // Emit back to sender
      socket.emit('messageDelivered', populatedMsg);
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Mark private messages as seen
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
      console.error('Error marking messages as seen:', err);
    }
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

http.listen(5000, () => console.log('Server running on port 5000'));
