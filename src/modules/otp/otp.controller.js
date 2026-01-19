import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import UserSchema from "../../../db/models/user.js";
import OTP from "../../../db/models/otp.js";
import AppError from "../../../utils/appError.js";
import catchAsyncError from "../../../utils/catchAsync.js";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserSchema.findOne({ where: { email } });
  if (!user) {
    return next(new AppError("User with this email does not exist", 404));
  }

  const otpCode = generateOTP();
  const expiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  await otpCode.create({
    code: otpCode,
    expiredAt,
    userId: user.id,
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is ${otpCode}. It will expire in 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);

  res.status(200).json({
    status: "success",
    message: "OTP sent to email",
    resetToken,
  });
});
