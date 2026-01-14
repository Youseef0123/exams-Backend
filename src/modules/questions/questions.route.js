import { Router } from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  submitAnswers,
  getMyQuestions,
} from "./questions.controller.js";
import { protect, restrictTo } from "../../middleware/auth.js";
import {
  validateCreateQuestion,
  validateSubmitAnswer,
} from "./questions.validation.js";

const QuestionsRouter = Router();

QuestionsRouter.use(protect);

// Public for authenticated users
QuestionsRouter.get("/", getAllQuestions);
QuestionsRouter.get("/:id", getQuestionById);
QuestionsRouter.post("/submit", validateSubmitAnswer, submitAnswers);

// Teacher only routes
QuestionsRouter.post(
  "/",
  restrictTo("teacher"),
  validateCreateQuestion,
  createQuestion
);

QuestionsRouter.get(
  "/teacher/my-questions",
  restrictTo("teacher"),
  getMyQuestions
);
QuestionsRouter.patch(
  "/:id",
  restrictTo("teacher"),
  validateCreateQuestion,
  updateQuestion
);
QuestionsRouter.delete("/:id", restrictTo("teacher"), deleteQuestion);

export default QuestionsRouter;
