export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/lib/models/Question';

export async function GET(req) {
  try {
    await dbConnect();

    // Admin-only endpoint
    const adminPass = req.headers.get('x-admin-password');
    const expected = process.env.ADMIN_PASSWORD || 's1ddhant';
    if (!adminPass || adminPass !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const round = req.nextUrl.searchParams.get('round');
    const filter = { isActive: true };
    if (round) filter.round = parseInt(round);

    const questions = await Question.find(filter)
      .sort({ round: 1, questionNumber: 1 })
      .lean();

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Admin questions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
