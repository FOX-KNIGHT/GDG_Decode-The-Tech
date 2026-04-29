const adminPass = 'admin123';
const baseUrl = 'http://localhost:3000';

async function testFlow() {
  console.log('--- ADDING QUESTION ---');
  const payload = {
    round: 1,
    basePoints: 10,
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Paris",
    explanation: "Paris is the capital of France."
  };

  const addRes = await fetch(`${baseUrl}/api/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
    body: JSON.stringify(payload)
  });
  console.log('Add Question Response:', addRes.status, await addRes.text());

  console.log('\n--- CHECKING DB (GET QUESTIONS) ---');
  const getRes = await fetch(`${baseUrl}/api/questions`);
  const getData = await getRes.json();
  const addedQ = getData.questions.find(q => q.question === payload.question);
  console.log('Is Question in DB?:', !!addedQ);

  console.log('\n--- REGISTERING TEAM ---');
  const teamRes = await fetch(`${baseUrl}/api/teams/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'TestTeam', members: ['Player 1'] })
  });
  const teamData = await teamRes.json();
  console.log('Team registered:', teamData.team?.teamId);

  console.log('\n--- STARTING ROUND 1 ---');
  await fetch(`${baseUrl}/api/game/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
    body: JSON.stringify({ action: 'start_round', round: 1, duration: 900 })
  });
  console.log('Round 1 started');

  console.log('\n--- FETCHING PLAYER DASHBOARD STATE ---');
  const stateRes = await fetch(`${baseUrl}/api/game/state`, {
    headers: { 'x-team-id': teamData.team?.teamId }
  });
  const stateData = await stateRes.json();
  
  if (stateData.gameData && stateData.gameData.questions) {
     const isQInState = stateData.gameData.questions.some(q => q.question === payload.question);
     console.log('Is new question reflected on player dashboard state?:', isQInState);
  } else {
     console.log('No questions in player state:', stateData);
  }
}

testFlow().catch(console.error);
