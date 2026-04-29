import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  round: { type: Number, required: true, enum: [1, 2, 3] },
  questionNumber: { type: Number, required: true },
  
  // Round 1: Tech Jargon - Q is the meaning, options are jargons
  // Round 2: Emoji Clue - Q is emoji string, options are app names  
  // Round 3: Tech Facts - Q is the fact, options are ["Real", "Fake"]
  question: { type: String, required: true },
  
  // For emoji round: store the emoji display separately
  emojiClue: { type: String, default: '' },
  
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }, // the correct option text
  
  // Round 3 special: players must choose the OPPOSITE of correct
  // So if fact is Real, they should answer "Fake" to be correct in the game
  actualFact: { type: String, enum: ['Real', 'Fake'], default: 'Real' },
  
  explanation: { type: String, default: '' },
  
  basePoints: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
