const adminPass = 's1ddhant';
const baseUrl = 'http://localhost:3000';

async function testFlow() {
  console.log('--- FETCHING PLAYER DASHBOARD STATE ---');
  const teamId = 'team-001'; // From previous run
  const stateRes = await fetch(`${baseUrl}/api/game/questions?teamId=${teamId}&round=1`);
  const stateData = await stateRes.json();
  
  if (stateData.questions) {
     const isQInState = stateData.questions.some(q => q.question === "What is the capital of France?");
     console.log('Is new question reflected on player dashboard state?:', isQInState);
     if (isQInState) {
       console.log("SUCCESS: The question is reflected correctly!");
     } else {
       console.log("FAILURE: Question not found.");
     }
  } else {
     console.log('No questions in player state:', stateData);
  }
}

testFlow().catch(console.error);
