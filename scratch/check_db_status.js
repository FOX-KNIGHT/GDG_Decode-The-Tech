
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://ayush5459988_db_user:s1ddhant@zerone.fajmpej.mongodb.net/decode-the-tech";

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');
  
  const GameSession = mongoose.models.GameSession || mongoose.model('GameSession', new mongoose.Schema({
    sessionId: String,
    status: String,
    currentRound: Number,
    roundEndTime: Date
  }, { collection: 'gamesessions' }));

  const session = await GameSession.findOne({ sessionId: 'main' });
  console.log('Session:', JSON.stringify(session, null, 2));

  const Team = mongoose.models.Team || mongoose.model('Team', new mongoose.Schema({
    teamId: String,
    teamName: String,
    isDisqualified: Boolean,
    isEliminated: Boolean
  }, { collection: 'teams' }));

  const teams = await Team.find({});
  console.log('Teams count:', teams.length);
  if (teams.length > 0) {
    console.log('First team:', JSON.stringify(teams[0], null, 2));
  }

  process.exit(0);
}

check();
