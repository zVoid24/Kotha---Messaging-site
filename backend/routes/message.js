// Fixed routes/message.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');

// routes/message.js
// GET unseen messages count (private + groups)
router.get('/unseen/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Private messages
    const unseenPrivate = await Message.aggregate([
      { $match: { receiver: new mongoose.Types.ObjectId(userId), seen: false } },
      { $group: { _id: '$sender', count: { $sum: 1 } } }
    ]);

    // Group messages
    const unseenGroup = await Message.aggregate([
      { $match: { group: { $exists: true }, seen: false } },
      { $lookup: {
          from: 'groups',
          localField: 'group',
          foreignField: '_id',
          as: 'groupInfo'
      }},
      { $unwind: '$groupInfo' },
      { $match: { 'groupInfo.members': new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$group', count: { $sum: 1 } } }
    ]);

    res.json({ private: unseenPrivate, group: unseenGroup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching unseen counts' });
  }
});


// GET group messages
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({ group: groupId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username _id')
      .populate('receiver', 'username _id');
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch group messages' });
  }
});


router.get('/:userId/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    console.log(`Fetching messages between ${userId} and ${friendId}`);
    
    // First, fetch the messages
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    
    console.log('Fetched messages:', messages.length);
    
    // Mark messages as seen and emit socket event
    const updateResult = await Message.updateMany(
      { sender: friendId, receiver: userId, seen: false },
      { $set: { seen: true } }
    );
    
    // FIXED: Emit socket event when messages are marked as seen via REST API
    if (updateResult.modifiedCount > 0 && req.io) {
      const eventData = { senderId: friendId, receiverId: userId };
      console.log(`Emitting messagesSeen event for ${updateResult.modifiedCount} messages`);
      
      // Notify the sender that their messages were seen
      req.io.to(friendId).emit('messagesSeen', eventData);
      // Also notify the receiver for consistency
      req.io.to(userId).emit('messagesSeen', eventData);
    }
    
    // Return updated messages (refetch to get updated seen status)
    const updatedMessages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(updatedMessages);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});




module.exports = router;