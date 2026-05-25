import React from "react";

export interface StatItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface ExamSummary {
  id: string;
  title: string;
  duration: string;
  startTime: string;
  status: "active" | "ongoing" | "upcoming" | "completed" | "draft" | "suspended";
  questions: number;
  score?: string;
  violations?: number;
  grade?: string;
  subject?: string;
}

export interface Result {
  examTitle: string;
  score: number;
  total: number;
  date: string;
  duration: string;
  performance: "excellent" | "good" | "average" | "poor";
  grade?: string;
  subject?: string;
}
