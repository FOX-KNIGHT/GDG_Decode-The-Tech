export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Team from '@/lib/models/Team';

export async function POST(req, { params }) {
  try {
    await dbConnect();

    const { teamId } = params;
    const body = await req.json();
    const { isDisqualified, reason } = body;

    const adminPass = req.headers.get('x-admin-password');
    const expectedPass = process.env.ADMIN_PASSWORD || 'admin123';
    const isAdmin = adminPass === expectedPass;

    // Banning (disqualifying) can be done by the game itself (no auth needed — anti-cheat)
    // Unbanning REQUIRES admin password
    if (isDisqualified === false && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized — only admin can unban' }, { status: 401 });
    }

    const updateData = {
      isDisqualified: isDisqualified === true,
    };

    // Track the ban reason and timestamp
    if (isDisqualified === true) {
      updateData.disqualifiedAt = new Date();
      updateData.disqualifiedReason = reason || 'Exited fullscreen / switched tabs during active round';
    } else if (isDisqualified === false) {
      updateData.disqualifiedAt = null;
      updateData.disqualifiedReason = null;
    }

    const team = await Team.findOneAndUpdate(
      { teamId },
      { $set: updateData },
      { new: true }
    );

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('Disqualify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
