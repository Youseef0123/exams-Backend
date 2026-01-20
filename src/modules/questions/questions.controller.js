import QuestionSchema from "../../../db/models/questions.js";
import AppError from "../../utils/AppError.js";
import catchAsyncError from "../../handlers/handelAsyncError.js";

export const createQuestion = catchAsyncError(async (req, res, next) => {
  const { questionText, options, correctAnswer } = req.body;

  const newQuestion = await QuestionSchema.create({
    questionText,
    options,
    correctAnswer,
    userId: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: { question: newQuestion },
  });
});

// get all questions
// for test
export const getAllQuestions = catchAsyncError(async (req, res, next) => {
  const questions = await QuestionSchema.findAll({
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    status: "success",
    results: questions.length,
    data: { questions },
  });
});

// get question by id

export const getQuestionById = catchAsyncError(async (req, res, next) => {
  const question = await QuestionSchema.findByPk(req.params.id);

  if (!question) {
    return next(new AppError("No question found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { question },
  });
});

// update question by teacher only

export const updateQuestion = catchAsyncError(async (req, res, next) => {
  const question = await QuestionSchema.findByPk(req.params.id);

  if (!question) {
    return next(new AppError("No question found with that ID", 404));
  }

  if (question.userId !== req.user.id) {
    return next(
      new AppError("You do not have permission to update this question", 403)
    );
  }

  const { questionText, options, correctAnswer } = req.body;
  question.questionText = questionText || question.questionText;
  question.options = options || question.options;
  question.correctAnswer = correctAnswer || question.correctAnswer;
  await question.save();

  res.status(200).json({
    status: "success",
    data: { question },
  });
});

// delete question by teacher only
export const deleteQuestion = catchAsyncError(async (req, res, next) => {
  const question = await QuestionSchema.findByPk(req.params.id);

  if (!question) {
    return next(new AppError("No question found with that ID", 404));
  }

  if (question.userId !== req.user.id) {
    return next(
      new AppError("You do not have permission to delete this question", 403)
    );
  }

  const deletedQuestion = await question.destroy();

  res.status(204).json({
    status: "Question deleted successfully",
    data: { question: deletedQuestion },
  });
});

// Submit Answers and Get Results
export const submitAnswers = catchAsyncError(async (req, res, next) => {
  const { answers } = req.body;

  let score = 0;
  const results = [];

  for (const answer of answers) {
    const question = await QuestionSchema.findByPk(answer.questionId);

    if (!question) {
      results.push({
        questionId: answer.questionId,
        status: "Question not found",
        isCorrect: false,
      });
      continue;
    }

    const isCorrect = question.correctAnswer === answer.userAnswer;
    if (isCorrect) {
      score++;
    }

    results.push({
      questionId: answer.questionId,
      questionText: question.questionText,
      userAnswer: answer.userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
    });
  }

  const totalQuestions = answers.length;
  const percentage = (score / totalQuestions) * 100;

  res.status(200).json({
    status: "success",
    data: {
      score,
      totalQuestions,
      percentage: percentage.toFixed(2) + "%",
      results,
    },
  });
});

// Get My Questions (Teacher's own questions)
export const getMyQuestions = catchAsyncError(async (req, res, next) => {
  const questions = await QuestionSchema.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    status: "success",
    results: questions.length,
    data: {
      questions,
    },
  });
});
