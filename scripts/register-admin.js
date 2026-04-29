const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const TeamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  teamName: { type: String, required: true },
  teamNumber: { type: Number },
  players: [{ name: String, playerNumber: Number }],
  scores: { round1: Number, round2: Number, round3: Number, total: Number },
  currentPlayerIndex: { type: Number, default: 0 },
  email: { type: String }, // adding email and password for the user's request
  password: { type: String }
});

const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

async function registerAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Create or update the ADMIN team
    await Team.findOneAndUpdate(
      { teamName: 'ADMIN' },
      {
        teamId: 'ADMIN-000',
        teamName: 'ADMIN',
        teamNumber: 0,
        players: [
          { name: 'Admin Player 1', playerNumber: 1 },
          { name: 'Admin Player 2', playerNumber: 2 },
          { name: 'Admin Player 3', playerNumber: 3 },
        ],
        scores: { round1: 0, round2: 0, round3: 0, total: 0 },
        currentPlayerIndex: 0,
        email: 'admin@zerone.io',
        password: 'admin123'
      },
      { upsert: true, new: true }
    );

    console.log('Registered ADMIN team successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

registerAdmin();
