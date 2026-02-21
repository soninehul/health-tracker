const mongoose = require('mongoose');

function wordCount(str) {
  if (!str || typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

const blogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      validate: {
        validator(v) {
          return wordCount(v) <= 1000;
        },
        message: 'Blog entry must be 1000 words or fewer.',
      },
    },
  },
  { timestamps: true }
);

blogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Blog', blogSchema);
