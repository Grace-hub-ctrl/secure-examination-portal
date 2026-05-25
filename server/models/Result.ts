import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  answers: [{
    questionId: String,
    selectedOption: Number,
    isCorrect: Boolean,
  }],
  duration: {
    type: String, // in minutes/seconds format
  },
  performance: {
    type: String,
    enum: ["excellent", "good", "average", "poor"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Result = mongoose.model("Result", resultSchema);
