const express = require('express');
const Metric = require('../models/Metric');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Upsert metrics for a day (add or update)
router.post('/', async (req, res) => {
  try {
    const { date, weight, steps, calories, sleepHours } = req.body;
    const userId = req.user._id;

    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }

    const day = new Date(date);
    if (isNaN(day.getTime())) {
      return res.status(400).json({ message: 'Invalid date.' });
    }
    day.setUTCHours(0, 0, 0, 0);

    const payload = { weight, steps, calories, sleepHours };
    const hasAny = [weight, steps, calories, sleepHours].some((v) => v != null && v !== '');
    if (!hasAny) {
      return res.status(400).json({ message: 'Provide at least one metric (weight, steps, calories, or sleep).' });
    }

    const update = { user: userId, date: day };
    if (weight != null && weight !== '') update.weight = Number(weight);
    if (steps != null && steps !== '') update.steps = Number(steps);
    if (calories != null && calories !== '') update.calories = Number(calories);
    if (sleepHours != null && sleepHours !== '') update.sleepHours = Number(sleepHours);

    const metric = await Metric.findOneAndUpdate(
      { user: userId, date: day },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(metric);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message || 'Validation failed.' });
    }
    res.status(500).json({ message: err.message || 'Failed to save metrics.' });
  }
});

// List current user's metrics (optional date range)
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

    const metrics = await Metric.find(filter).sort({ date: -1 }).lean();
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load metrics.' });
  }
});

module.exports = router;
