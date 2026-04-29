export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/lib/models/Question';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const round = searchParams.get('round');
  
  const filter = { isActive: true };
  if (round) filter.round = parseInt(round);
  
  const questions = await Question.find(filter).sort({ round: 1, questionNumber: 1 }).lean();
  return NextResponse.json({ questions });
}

export async function POST(req) {
  await dbConnect();

  const adminPass = req.headers.get('x-admin-password');
  if (adminPass !== (process.env.ADMIN_PASSWORD || 'admin123')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const question = await Question.create(body);
  return NextResponse.json({ question }, { status: 201 });
}

export async function PUT(req) {
  await dbConnect();

  const adminPass = req.headers.get('x-admin-password');
  if (adminPass !== (process.env.ADMIN_PASSWORD || 'admin123')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { _id, ...update } = body;
  const question = await Question.findByIdAndUpdate(_id, update, { new: true });
  return NextResponse.json({ question });
}

export async function DELETE(req) {
  await dbConnect();

  const adminPass = req.headers.get('x-admin-password');
  if (adminPass !== (process.env.ADMIN_PASSWORD || 'admin123')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await Question.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Question deleted' });
}
