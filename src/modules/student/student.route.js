import {Router} from "express"
import {submitQuiz,getAllQuizzesForStudent,startQuizForStudent ,getStudentAnalytics,getUpcomingDeadlines, getCompletedQuizzesForStudent} from "./student.controller.js"
import {protect, restrictTo} from "../../middleware/auth.js"
import { validateSubmitQuiz } from "./student.validation.js";



const StudentRouter = Router()



// for authentication
StudentRouter.use(protect)


//get all quizzes for student 
StudentRouter.get("/all-quizzes",getAllQuizzesForStudent);

// start a quiz
StudentRouter.get("/quizzes/:quizId/start",restrictTo('user'),startQuizForStudent);

// submit a quiz
StudentRouter.post("/quizzes/submit",restrictTo('user'),validateSubmitQuiz,submitQuiz);

// student dashboard analytics 
StudentRouter.get("/dashboard",restrictTo('user'),getStudentAnalytics);

// get upcoming deadlines for student
StudentRouter.get("/upcoming-quizzes",restrictTo('user'),getUpcomingDeadlines);

// get completed quizzes for student
StudentRouter.get("/results",restrictTo('user'),getCompletedQuizzesForStudent);

export default StudentRouter;