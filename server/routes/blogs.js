const express = require('express');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Create or update blog for a date (upsert one per user per day)
router.post('/', async (req, res) => {
  try {
    const { date, content } = req.body;
    const userId = req.user._id;

    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }
    if (content == null || (typeof content === 'string' && !content.trim())) {
      return res.status(400).json({ message: 'Content is required.' });
    }

    const day = new Date(date);
    if (isNaN(day.getTime())) {
      return res.status(400).json({ message: 'Invalid date.' });
    }
    day.setUTCHours(0, 0, 0, 0);

    const blog = await Blog.findOneAndUpdate(
      { user: userId, date: day },
      { $set: { content: content.trim() } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(blog);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message || 'Validation failed.' });
    }
    res.status(500).json({ message: err.message || 'Failed to save blog.' });
  }
});

// List current user's blogs (optional from, to query)
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to } = req.query;

    const filter = { user: userId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setUTCHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const blogs = await Blog.find(filter).sort({ date: -1 }).lean();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load blogs.' });
  }
});

// Update existing blog by id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (content == null || (typeof content === 'string' && !content.trim())) {
      return res.status(400).json({ message: 'Content is required.' });
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { content: content.trim() } },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    res.json(blog);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message || 'Validation failed.' });
    }
    res.status(500).json({ message: err.message || 'Failed to update blog.' });
  }
});

module.exports = router;
