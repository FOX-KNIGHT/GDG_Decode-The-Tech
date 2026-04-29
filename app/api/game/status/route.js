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
    session = session.toObject();
  }

  // Auto-halt logic
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

  return NextResponse.json({ session });
}

