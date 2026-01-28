const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  headline: {
    type: String,
    required: true,
    unique: true,
  },
  preview: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL to the image
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
