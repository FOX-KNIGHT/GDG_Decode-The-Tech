import dbConnect from '@/lib/mongodb';
import GameSession from '@/lib/models/GameSession';
import Team from '@/lib/models/Team';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await dbConnect();

  // 1. Fetch Session
  let session = await GameSession.findOne({ sessionId: 'main' }).lean();
  if (!session) {
    const newSession = await GameSession.create({
      sessionId: 'main',
      status: 'waiting',
      currentRound: 0,
    });
    session = newSession.toObject();
  }

  // Auto-halt logic for initial load
  if (session.status.includes('_active') && !session.isPaused && session.roundEndTime) {
    const now = new Date();
    if (now >= new Date(session.roundEndTime)) {
      const match = session.status.match(/round(\d+)_active/);
      if (match) {
        const newStatus = `round${match[1]}_ended`;
        await GameSession.updateOne({ sessionId: 'main' }, { $set: { status: newStatus } });
        session.status = newStatus;
      }
    }
  }

  // 2. Fetch Teams
  const teams = await Team.find({}).sort({ teamNumber: 1 }).lean();

  // 3. Leaderboard Logic
  const leaderboardTeams = await Team.find({ isActive: true, isDisqualified: { $ne: true } }).lean();
  
  leaderboardTeams.sort((a, b) => {
    if (b.scores.total !== a.scores.total) {
      return b.scores.total - a.scores.total;
    }
    
    const getLastAnswerTime = (team) => {
      const allAnswers = [
        ...(team.answeredQuestions?.round1 || []),
        ...(team.answeredQuestions?.round2 || []),
        ...(team.answeredQuestions?.round3 || [])
      ];
      if (allAnswers.length === 0) return 0;
      return Math.max(...allAnswers.map(ans => new Date(ans.answeredAt).getTime()));
    };

    const timeA = getLastAnswerTime(a);
    const timeB = getLastAnswerTime(b);
    
    if (timeA === 0) return 1;
    if (timeB === 0) return -1;
    
    return timeA - timeB;
  });

  const leaderboard = leaderboardTeams.map((team, index) => ({
    rank: index + 1,
    teamId: team.teamId,
    teamName: team.teamName,
    teamNumber: team.teamNumber,
    players: team.players?.map(p => p.name) || [],
    scores: team.scores,
    answeredCount: {
      round1: team.answeredQuestions?.round1?.length || 0,
      round2: team.answeredQuestions?.round2?.length || 0,
      round3: team.answeredQuestions?.round3?.length || 0,
    },
  }));

  return (
    <AdminClient 
      initialSession={JSON.parse(JSON.stringify(session))} 
      initialTeams={JSON.parse(JSON.stringify(teams))} 
      initialLeaderboard={JSON.parse(JSON.stringify(leaderboard))} 
    />
  );
}
