import dbConnect from '@/lib/mongodb';
import Team from '@/lib/models/Team';
import GameSession from '@/lib/models/GameSession';
import TeamClient from './TeamClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TeamPage({ params }) {
  await dbConnect();
  
  const { teamId } = params;
  
  const [team, session] = await Promise.all([
    Team.findOne({ teamId }).lean(),
    GameSession.findOne({ sessionId: 'main' }).lean(),
  ]);

  if (!team) {
    notFound();
  }

  return (
    <TeamClient 
      initialTeam={JSON.parse(JSON.stringify(team))} 
      initialSession={JSON.parse(JSON.stringify(session || {}))} 
    />
  );
}
