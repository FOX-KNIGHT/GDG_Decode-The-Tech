import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Team from '@/lib/models/Team';
import GameSession from '@/lib/models/GameSession';

export async function GET() {
  await dbConnect();
  
  const [teams, session] = await Promise.all([
    Team.find({ isActive: true, isDisqualified: { $ne: true } }).lean(),
    GameSession.findOne({ sessionId: 'main' }).lean(),
  ]);

  // Sort teams: Primary by scores.total DESC, Secondary by last answer timestamp ASC (fastest)
  teams.sort((a, b) => {
    if (b.scores.total !== a.scores.total) {
      return b.scores.total - a.scores.total;
    }
    
    // Tie breaker: Find the latest answeredAt timestamp for each team
    const getLastAnswerTime = (team) => {
      const allAnswers = [
        ...team.answeredQuestions.round1,
        ...team.answeredQuestions.round2,
        ...team.answeredQuestions.round3
      ];
      if (allAnswers.length === 0) return 0;
      return Math.max(...allAnswers.map(ans => new Date(ans.answeredAt).getTime()));
    };

    const timeA = getLastAnswerTime(a);
    const timeB = getLastAnswerTime(b);
    
    // If one team hasn't answered anything, they drop down
    if (timeA === 0) return 1;
    if (timeB === 0) return -1;
    
    return timeA - timeB; // Ascending time means earlier (faster) time comes first
  });

  const leaderboard = teams.map((team, index) => ({
    rank: index + 1,
    teamId: team.teamId,
    teamName: team.teamName,
    teamNumber: team.teamNumber,
    players: team.players.map(p => p.name),
    scores: team.scores,
    answeredCount: {
      round1: team.answeredQuestions.round1.length,
      round2: team.answeredQuestions.round2.length,
      round3: team.answeredQuestions.round3.length,
    },
  }));

  return NextResponse.json({ leaderboard, session });
}
