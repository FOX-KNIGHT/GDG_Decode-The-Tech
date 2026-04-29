const adminPass = 'admin123';
const baseUrl = 'http://localhost:3000';

async function testFlow() {
  console.log('--- REGISTERING TEAM ---');
  const teamRes = await fetch(`${baseUrl}/api/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'TestTeam3', players: ['Player 1', 'Player 2'] })
  });
  
  if (!teamRes.ok) {
    console.log('Error registering team:', teamRes.status, await teamRes.text());
    return;
  }
  const teamData = await teamRes.json();
  console.log('Team registered:', teamData.team?.teamId);

  console.log('\n--- FETCHING PLAYER DASHBOARD STATE ---');
  const stateRes = await fetch(`${baseUrl}/api/game/state`, {
    headers: { 'x-team-id': teamData.team?.teamId }
  });
  const stateData = await stateRes.json();
  
  if (stateData.gameData && stateData.gameData.questions) {
     const isQInState = stateData.gameData.questions.some(q => q.question === "What is the capital of France?");
     console.log('Is new question reflected on player dashboard state?:', isQInState);
  } else {
     console.log('No questions in player state:', stateData);
  }
}

testFlow().catch(console.error);
