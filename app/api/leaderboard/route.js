export const dynamic = 'force-dynamic';
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

  // Sort teams: Primary by scores.total DESC, Secondary by completion time of CURRENT ROUND ASC (fastest)
  const roundKey = `round${session?.currentRound || 1}`;

  teams.sort((a, b) => {
    if (b.scores.total !== a.scores.total) {
      return b.scores.total - a.scores.total;
    }
    
    // Tie breaker: Find the completion time for the CURRENT round
    const getRoundCompletionTime = (team) => {
      const answers = team.answeredQuestions?.[roundKey] || [];
      if (answers.length === 0) return Infinity; // Hasn't started round yet, rank lower
      return Math.max(...answers.map(ans => new Date(ans.answeredAt).getTime()));
    };

    const timeA = getRoundCompletionTime(a);
    const timeB = getRoundCompletionTime(b);
    
    return timeA - timeB; // Ascending time means earlier (faster) time comes first
  });

  const leaderboard = teams.map((team, index) => {
    const allAnswers = [
      ...team.answeredQuestions.round1,
      ...team.answeredQuestions.round2,
      ...team.answeredQuestions.round3
    ];
    const lastAnswerTime = allAnswers.length > 0 
      ? Math.max(...allAnswers.map(ans => new Date(ans.answeredAt).getTime())) 
      : null;

    return {
      rank: index + 1,
      teamId: team.teamId,
      teamName: team.teamName,
      teamNumber: team.teamNumber,
      players: team.players.map(p => p.name),
      scores: team.scores,
      lastAnswerTime,
      answeredCount: {
        round1: team.answeredQuestions.round1.length,
        round2: team.answeredQuestions.round2.length,
        round3: team.answeredQuestions.round3.length,
      },
    };
  });

  return NextResponse.json(
    { leaderboard, session },
    {
      headers: {
        'Cache-Control': 's-maxage=3, stale-while-revalidate=5',
      },
    }
  );
}

