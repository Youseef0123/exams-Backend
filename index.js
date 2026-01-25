import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDb } from "./db/connection.js";
import globalError from "./src/utils/globalError.js";
import UserRouter from "./src/modules/user/user.route.js";
import AppError from "./src/utils/AppError.js";
import QuestionRouter from "./src/modules/questions/questions.route.js";
import otpRouter from "./src/modules/otp/otp.route.js";
import QuizRouter from "./src/modules/quiz/quiz.route.js";
import StudentRouter from "./src/modules/student/student.route.js";
import TeacherRouter from  "./src/modules/teacher/teacher.route.js"
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
connectDb();

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message,
    stack: err.stack,
  });
});

// routes
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/questions", QuestionRouter);
app.use("/api/v1", otpRouter);
app.use("/api/v1/quizzes", QuizRouter);
app.use("/api/v1/student", StudentRouter);
app.use("/api/v1/teacher",TeacherRouter)
// Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalError);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
