const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  preferences: [{
    preference: {
      type: String,
      required: true
    },
    priority: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    }
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
