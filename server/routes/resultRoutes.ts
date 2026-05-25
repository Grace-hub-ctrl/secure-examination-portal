import express from "express";
import { submitResult, getResults, logViolation, getViolations } from "../controllers/resultController.ts";
import { authenticate } from "../middleware/auth.ts";

const router = express.Router();

router.post("/submit", authenticate, submitResult);
router.get("/", authenticate, getResults);
router.post("/violation", authenticate, logViolation);
router.get("/violations", authenticate, getViolations);

export default router;
