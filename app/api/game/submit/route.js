import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Team from '@/lib/models/Team';
import Question from '@/lib/models/Question';
import GameSession from '@/lib/models/GameSession';

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const { teamId, questionId, answer, round } = body;

  if (!teamId || !questionId || !answer || !round) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const [team, question, session] = await Promise.all([
    Team.findOne({ teamId }),
    Question.findById(questionId),
    GameSession.findOne({ sessionId: 'main' }),
  ]);

  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

  // Check if game round is active
  if (!session || session.status !== `round${round}_active`) {
    return NextResponse.json({ error: 'Round not active' }, { status: 400 });
  }

  // Check if already answered
  const roundKey = `round${round}`;
  const alreadyAnswered = team.answeredQuestions[roundKey].find(
    a => a.questionId === String(questionId)
  );
  if (alreadyAnswered) {
    return NextResponse.json({ error: 'Already answered', result: alreadyAnswered }, { status: 400 });
  }

  // Check correctness
  const isCorrect = answer === question.correctAnswer;
  const now = new Date();
  const timeTaken = Math.max(0, (now - session.roundStartTime) / 1000);

  // Calculate points
  let points = 0;
  if (isCorrect) {
    points = question.basePoints;
    
    // Time bonus: up to 5 extra points in first 30 seconds
    if (session.settings?.timeBonusEnabled) {
      const timeBonus = Math.max(0, Math.floor(5 * (1 - timeTaken / 30)));
      points += timeBonus;
    }

    // Check fastest fingers for this question
    const fastestForQuestion = session.fastestAnswers[roundKey].find(
      fa => fa.questionId === String(questionId)
    );
    
    if (!fastestForQuestion) {
      // First team to answer this question correctly!
      const bonus = session.settings?.fastestFingerBonus || 5;
      points += bonus;
      
      session.fastestAnswers[roundKey].push({
        teamId,
        teamName: team.teamName,
        questionId: String(questionId),
        answeredAt: now,
        timeTaken,
      });
      await session.save();
    }
  }

  // Save the answer
  team.answeredQuestions[roundKey].push({
    questionId: String(questionId),
    answeredAt: now,
    correct: isCorrect,
    points,
  });

  // Update scores
  team.scores[roundKey] = (team.scores[roundKey] || 0) + points;
  team.scores.total = team.scores.round1 + team.scores.round2 + team.scores.round3 + team.scores.bonusPoints;
  
  await team.save();

  return NextResponse.json({
    correct: isCorrect,
    points,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    totalScore: team.scores.total,
  });
}
