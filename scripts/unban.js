const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  await db.collection('teams').updateOne({ teamId: 'team-001' }, { $set: { isDisqualified: false, disqualifiedReason: null } });
  console.log('Team unbanned.');
  await client.close();
}

run();
