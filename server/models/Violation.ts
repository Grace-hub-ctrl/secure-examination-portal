import mongoose from "mongoose";

const violationSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ["Tab Switch", "Fullscreen Exit", "Suspicious Activity"],
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Violation = mongoose.model("Violation", violationSchema);
