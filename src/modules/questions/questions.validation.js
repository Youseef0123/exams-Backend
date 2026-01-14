const validateCreateQuestion = (req, res, next) => {
  const { questionText, options, correctAnswer } = req.body;
  const errors = [];

  if (!questionText || questionText.trim().length < 5) {
    errors.push("Question text must be at least 5 characters long");
  }
  if (!options || !Array.isArray(options) || options.length < 2) {
    errors.push("Options must be an array with at least 2 items");
  }
  if (!correctAnswer || correctAnswer.trim().length === 0) {
    errors.push("Correct answer must be provided");
  }
  if (options && correctAnswer && !options.includes(correctAnswer)) {
    errors.push("Correct answer must be one of the options");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      errors,
    });
  }
  next();
};

const validateSubmitAnswer = (req, res, next) => {
  const { answers } = req.body;
  const errors = [];

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    errors.push("Answers must be an array with at least one answer");
  }

  if (answers) {
    answers.forEach((answer, index) => {
      if (!answer.questionId || !answer.userAnswer) {
        errors.push(
          `Answer at index ${index} must have questionId and userAnswer`
        );
      }
    });
  }
  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      errors,
    });
  }

  next();
};

export { validateCreateQuestion, validateSubmitAnswer };
