import { Request, Response } from "express";
import { Result } from "../models/Result.ts";
import { Violation } from "../models/Violation.ts";
import { AuthRequest } from "../middleware/auth.ts";
import { z } from "zod";

const resultSchema = z.object({
  examId: z.string(),
  score: z.number(),
  total: z.number(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOption: z.number(),
    isCorrect: z.boolean(),
  })),
  duration: z.string().optional(),
  performance: z.enum(["excellent", "good", "average", "poor"]).optional(),
});

const violationSchema = z.object({
  examId: z.string(),
  type: z.enum(["Tab Switch", "Fullscreen Exit", "Suspicious Activity"]),
  severity: z.enum(["low", "medium", "high"]).optional(),
});

export const submitResult = async (req: AuthRequest, res: Response) => {
  try {
    const validated = resultSchema.parse(req.body);
    const result = new Result({
      ...validated,
      studentId: req.user?.id,
    });
    await result.save();
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getResults = async (req: AuthRequest, res: Response) => {
  try {
    const query: any = {};
    if (req.user?.role === "student") {
      query.studentId = req.user.id;
    } else if (req.user?.role === "teacher") {
      // Teachers might want results for their exams
      // This would require a more complex query or examId filtering
    }

    const results = await Result.find(query)
      .populate("examId", "title")
      .populate("studentId", "name email");
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logViolation = async (req: AuthRequest, res: Response) => {
  try {
    const validated = violationSchema.parse(req.body);
    const violation = new Violation({
      ...validated,
      studentId: req.user?.id,
    });
    await violation.save();
    res.status(201).json(violation);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getViolations = async (req: AuthRequest, res: Response) => {
  try {
    const query: any = {};
    if (req.user?.role === "student") {
      query.studentId = req.user.id;
    }

    const violations = await Violation.find(query)
      .populate("examId", "title")
      .populate("studentId", "name email");
    res.status(200).json(violations);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
