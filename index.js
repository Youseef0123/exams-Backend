import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./db/connection.js";
import globalError from "./src/utils/globalError.js";
import UserRouter from "./src/modules/user/user.route.js";
import AppError from "./src/utils/AppError.js";
import QuestionRouter from "./src/modules/questions/questions.route.js";
dotenv.config();

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

// Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalError);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// comment for deployment
