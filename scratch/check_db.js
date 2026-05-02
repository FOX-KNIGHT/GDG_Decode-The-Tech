const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://ayush5459988_db_user:s1ddhant@zerone.fajmpej.mongodb.net/decode-the-tech';

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');
  const Team = mongoose.models.Team || mongoose.model('Team', new mongoose.Schema({}, { strict: false }));
  const team = await Team.findOne({ teamId: 'team-001' });
  console.log('Team:', JSON.stringify(team, null, 2));
  
  const GameSession = mongoose.models.GameSession || mongoose.model('GameSession', new mongoose.Schema({}, { strict: false }));
  const session = await GameSession.findOne({ sessionId: 'main' });
  console.log('Session:', JSON.stringify(session, null, 2));
  
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
