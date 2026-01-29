const mongoose = require("mongoose");

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
  preferences: {
    type: [
      {
        preference: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        priority: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],
    default: [
      { preference: "ai", priority: 3 },
      { preference: "security", priority: 2 },
      { preference: "startups", priority: 1 },
    ],
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
