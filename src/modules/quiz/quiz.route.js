import { Router } from "express";
import {createQuiz,getAllQuizzes,getQuizById,updateQuiz,deleteQuiz,togglePublish} from "./quiz.controller.js"
import { validateCreateQuiz, validateUpdateQuiz } from './quiz.validation.js';
import { protect, restrictTo } from "../../middleware/auth.js";


const QuizRouter = Router();
// to check the authentication 
QuizRouter.use(protect);

QuizRouter.post("/create-quiz", restrictTo("teacher"), validateCreateQuiz, createQuiz);
QuizRouter.get("/teacher/my-quizzes", restrictTo("teacher"), getAllQuizzes);
QuizRouter.get("/:id",restrictTo("teacher"), getQuizById);
QuizRouter.put("/:id", restrictTo("teacher"), validateUpdateQuiz, updateQuiz);
QuizRouter.delete("/:id", restrictTo("teacher"), deleteQuiz);
QuizRouter.patch("/publish/:id", restrictTo("teacher"), togglePublish);
export default QuizRouter;