require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const sampleUsers = [
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'alice123' },
  { name: 'Bob Smith', email: 'bob@example.com', password: 'bob123' },
  { name: 'Carol Davis', email: 'carol@example.com', password: 'carol123' },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    for (const data of sampleUsers) {
      const existing = await User.findOne({ email: data.email });
      if (existing) {
        console.log(`User ${data.email} already exists, skipping`);
        continue;
      }
      const user = await User.create(data);
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    console.log('Seed completed.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
