const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// Create group
router.post('/', async (req, res) => {
  try {
    const { name, members, admin } = req.body;
    const group = new Group({ name, members, admin });
    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create group' });
  }
});

// Get groups for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await Group.find({ members: userId });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
});

module.exports = router;
