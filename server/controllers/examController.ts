import { Request, Response } from "express";
import { Exam } from "../models/Exam.ts";
import { AuthRequest } from "../middleware/auth.ts";
import { z } from "zod";

const examSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  duration: z.number().min(1),
  questions: z.array(z.object({
    text: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.number().min(0).max(3),
    points: z.number().optional(),
  })),
  status: z.enum(["draft", "upcoming", "ongoing", "completed"]).optional(),
  startTime: z.string().optional(),
});

export const createExam = async (req: AuthRequest, res: Response) => {
  try {
    const validated = examSchema.parse(req.body);
    const exam = new Exam({
      ...validated,
      teacherId: req.user?.id,
    });
    await exam.save();
    res.status(201).json(exam);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getExams = async (req: AuthRequest, res: Response) => {
  try {
    const query: any = {};
    if (req.user?.role === "student") {
      query.status = { $in: ["upcoming", "ongoing"] };
    } else if (req.user?.role === "teacher") {
      query.teacherId = req.user.id;
    }

    const exams = await Exam.find(query).populate("teacherId", "name");
    res.status(200).json(exams);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getExamById = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("teacherId", "name");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json(exam);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateExam = async (req: AuthRequest, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.teacherId.toString() !== req.user?.id && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this exam" });
    }

    const validated = examSchema.partial().parse(req.body);
    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, validated, { new: true });
    res.status(200).json(updatedExam);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteExam = async (req: AuthRequest, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.teacherId.toString() !== req.user?.id && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this exam" });
    }

    await Exam.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
