const validateSignup = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push("Name must be at least 3 characters long.");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format.");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (role && !["teacher", "user"].includes(role)) {
    errors.push("Role must be either 'teacher' or 'user'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push("Email is required.");
  }
  if (!password) {
    errors.push("Password is required.");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      errors,
    });
  }

  next();
};

export { validateSignup, validateLogin };
