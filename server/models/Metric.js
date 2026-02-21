const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema(
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
    weight: { type: Number, min: 0 },       // kg
    steps: { type: Number, min: 0 },
    calories: { type: Number, min: 0 },
    sleepHours: { type: Number, min: 0, max: 24 },
  },
  { timestamps: true }
);

metricSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Metric', metricSchema);
