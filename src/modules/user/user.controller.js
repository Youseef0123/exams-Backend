import jwt from "jsonwebtoken";
import UserSchema from "../../../db/models/user.js";
import AppError from "../../utils/AppError.js";
import catchAsyncError from "../../handlers/handelAsyncError.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsyncError(async (req, res, next) => {
  const { name, email, password, role, Institution, bio } = req.body;

  const existingUser = await UserSchema.findOne({ where: { email } });
  if (existingUser) {
    return next(new AppError("Email already in use", 400));
  }

  const newUser = await UserSchema.create({
    name,
    email,
    password,
    role: role || "user",
    Institution,
    bio,
  });
  createSendToken(newUser, 201, res);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserSchema.findOne({ where: { email } });

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await UserSchema.findAll({
    attributes: { exclude: ["password"] },
  });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = await UserSchema.findByPk(req.params.id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const getMe = catchAsyncError(async (req, res, next) => {
  const user = await UserSchema.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
  });

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, Institution, bio, email } = req.body;

  const user = await UserSchema.findByPk(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (email && email !== user.email) {
    const existingUser = await UserSchema.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError("Email already in use", 400));
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (Institution) user.Institution = Institution;
  if (bio) user.bio = bio;

  await user.save();

  user.password = undefined;

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
