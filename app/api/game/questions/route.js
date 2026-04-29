export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Team from '@/lib/models/Team';
import Question from '@/lib/models/Question';
import GameSession from '@/lib/models/GameSession';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  const round = parseInt(searchParams.get('round'));

  if (!teamId || !round) {
    return NextResponse.json({ error: 'teamId and round required' }, { status: 400 });
  }

  const team = await Team.findOne({ teamId }).lean();
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

  const session = await GameSession.findOne({ sessionId: 'main' }).lean();
  
  // Get all questions for this round
  const allQuestions = await Question.find({ round, isActive: true }).sort({ questionNumber: 1 }).lean();
  
  // Get the team's shuffled order for this round
  const roundKey = `round${round}`;
  let order = team.questionOrder[roundKey] || [];
  
  // Ensure all current valid indices are included in the order (handles newly added questions)
  const allIndices = allQuestions.map((_, i) => i);
  const missingIndices = allIndices.filter(i => !order.includes(i));
  if (missingIndices.length > 0 || order.length === 0) {
    order = [...(order.length > 0 ? order : allIndices), ...missingIndices];
  }
  
  // Reorder questions per team's shuffle
  const orderedQuestions = order.map(idx => allQuestions[idx]).filter(Boolean);
  
  // Get answered question IDs for this team
  const answered = team.answeredQuestions[roundKey] || [];
  const answeredIds = new Set(answered.map(a => a.questionId));
  
  // Strip correct answers from response (anti-cheat)
  const safeQuestions = orderedQuestions.map(q => ({
    _id: q._id,
    round: q.round,
    questionNumber: q.questionNumber,
    question: q.question,
    emojiClue: q.emojiClue || '',
    options: q.options,
    basePoints: q.basePoints,
    isAnswered: answeredIds.has(String(q._id)),
  }));

  return NextResponse.json({
    questions: safeQuestions,
    session: session ? {
      status: session.status,
      currentRound: session.currentRound,
      roundStartTime: session.roundStartTime,
      roundEndTime: session.roundEndTime,
    } : null,
    team: {
      teamName: team.teamName,
      currentPlayerIndex: team.currentPlayerIndex,
      players: team.players,
      scores: team.scores,
    }
  });
}
