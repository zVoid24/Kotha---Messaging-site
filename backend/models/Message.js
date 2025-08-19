const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // private chat
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },   // group chat
  text: { type: String, required: true },
  seen: { type: Boolean, default: false }, // for private messages
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
