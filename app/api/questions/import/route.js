import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/lib/models/Question';
import mammoth from 'mammoth';

export async function POST(req) {
  await dbConnect();

  // Admin password check
  const adminPass = req.headers.get('x-admin-password');
  if (adminPass !== (process.env.ADMIN_PASSWORD || 'admin123')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert docx to text
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    const questions = parseQuestions(text);

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions found in file. Please check the format.' }, { status: 400 });
    }

    // Assign question numbers and base points
    const existingCount = await Question.countDocuments();
    const formattedQuestions = questions.map((q, idx) => ({
      ...q,
      questionNumber: existingCount + idx + 1,
      isActive: true
    }));

    await Question.insertMany(formattedQuestions);

    return NextResponse.json({ 
      message: `Successfully imported ${formattedQuestions.length} questions`,
      count: formattedQuestions.length
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Internal server error during import' }, { status: 500 });
  }
}

function parseQuestions(text) {
  const questions = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  let currentRound = 1;
  let currentQuestion = null;

  for (let line of lines) {
    // Check for round marker: [Round 1] or Phase 01
    const roundMatch = line.match(/(?:Round|Phase)\s*(\d+)/i);
    if (roundMatch) {
      currentRound = parseInt(roundMatch[1]);
      continue;
    }

    // Check for question start: Q: or Question:
    const qMatch = line.match(/^(?:Q|Question):\s*(.*)/i);
    if (qMatch) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = {
        round: currentRound,
        question: qMatch[1],
        options: [],
        correctAnswer: '',
        explanation: '',
        emojiClue: '',
        basePoints: currentRound === 2 ? 15 : 10,
        actualFact: 'Real'
      };
      continue;
    }

    if (!currentQuestion) continue;

    // Check for options: A:, B:, etc.
    const optMatch = line.match(/^[A-D]:\s*(.*)/i);
    if (optMatch) {
      currentQuestion.options.push(optMatch[1]);
      continue;
    }

    // Check for emoji: Emoji:
    const emojiMatch = line.match(/^Emoji:\s*(.*)/i);
    if (emojiMatch) {
      currentQuestion.emojiClue = emojiMatch[1];
      continue;
    }

    // Check for correct answer: Correct: A or Correct: AnswerText
    const correctMatch = line.match(/^Correct:\s*(.*)/i);
    if (correctMatch) {
      const val = correctMatch[1].trim();
      if (val.length === 1 && ['A', 'B', 'C', 'D'].includes(val.toUpperCase())) {
        const idx = ['A', 'B', 'C', 'D'].indexOf(val.toUpperCase());
        currentQuestion.correctAnswer = currentQuestion.options[idx] || val;
      } else {
        currentQuestion.correctAnswer = val;
      }
      continue;
    }

    // Check for explanation: Explanation:
    const expMatch = line.match(/^Explanation:\s*(.*)/i);
    if (expMatch) {
      currentQuestion.explanation = expMatch[1];
      continue;
    }

    // Check for Fact state (Round 3)
    const factMatch = line.match(/^Fact:\s*(Real|Fake)/i);
    if (factMatch) {
      currentQuestion.actualFact = factMatch[1];
      continue;
    }
  }

  if (currentQuestion) questions.push(currentQuestion);

  return questions;
}
