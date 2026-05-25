import express from "express";
import { createExam, getExams, getExamById, updateExam, deleteExam } from "../controllers/examController.ts";
import { authenticate, authorize } from "../middleware/auth.ts";

const router = express.Router();

router.post("/", authenticate, authorize(["teacher", "admin"]), createExam);
router.get("/", authenticate, getExams);
router.get("/:id", authenticate, getExamById);
router.put("/:id", authenticate, authorize(["teacher", "admin"]), updateExam);
router.delete("/:id", authenticate, authorize(["teacher", "admin"]), deleteExam);

export default router;
