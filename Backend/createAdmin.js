require('dns').setServers(['8.8.8.8']);
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('./models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const name = (await ask('Admin name: ')).trim();
    const email = (await ask('Admin email: ')).trim().toLowerCase();
    const password = await ask('Admin password: ');

    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }

    if (password.length < 8) {
      throw new Error('Use a password with at least 8 characters.');
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        'An account with this email already exists. No account was created.'
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      approvalStatus: 'approved',
    });

    console.log(`Admin created successfully: ${admin.email}`);
  } catch (error) {
    console.error('Admin setup failed:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

createAdmin();
