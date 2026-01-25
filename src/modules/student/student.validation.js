const validateSubmitQuiz = (req, res, next) => {
  const { quizId, answers } = req.body;
  const errors = [];

  if (!quizId || isNaN(quizId)) {
    errors.push("Quiz ID is required and must be a valid number.");
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    errors.push("Answers are required and must be a non-empty array.");
  } else {
    answers.forEach((ans, index) => {
      if (!Array.isArray(ans) || ans.length !== 2) {
        errors.push(`Answer ${index + 1}: Must be an array with two elements [questionId, answer].`);
      } else {
        const [questionId, answer] = ans;
        if (!questionId || isNaN(questionId)) {
          errors.push(`Answer ${index + 1}: Question ID is required and must be a valid number.`);
        }
        if (answer === undefined || answer === null || (typeof answer !== 'string' && typeof answer !== 'boolean' && typeof answer !== 'number')) {
          errors.push(`Answer ${index + 1}: Answer is required and must be a valid value.`);
        }
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "failed",
      errors: errors
    });
  }

  next();
};

export { validateSubmitQuiz };