const express = require('express');
const User = require('../schema/Users');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   PUT /
// @desc    Update user preferences
// @access  Private
router.put('/', auth, async (req, res) => {
  const { preferences } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.preferences = preferences;
    await user.save();

    res.json(user.preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
