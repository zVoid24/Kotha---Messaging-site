const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// -------------------- REGISTER --------------------
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username & password required" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      username: newUser.username,
      id: newUser._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------- LOGIN --------------------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username & password required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      username: user.username,
      id: user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------- GET ALL USERS (Optional for chat) --------------------
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
