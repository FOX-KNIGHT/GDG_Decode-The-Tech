export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GameSession from '@/lib/models/GameSession';

export async function GET() {
  await dbConnect();
  let session = await GameSession.findOne({ sessionId: 'main' }).lean();
  if (!session) {
    session = await GameSession.create({
      sessionId: 'main',
      status: 'waiting',
      currentRound: 0,
    });
  }
  return NextResponse.json({ session });
}
