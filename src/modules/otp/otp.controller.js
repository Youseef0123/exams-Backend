import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import UserSchema from "../../../db/models/user.js";
import OTP from "../../../db/models/otp.js";
import AppError from "../../../src/utils/AppError.js";
import catchAsyncError from "../../../src/handlers/handelAsyncError.js";

// Create a transporter for testing with Ethereal
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'your-ethereal-user@ethereal.email', // Replace with actual Ethereal user
    pass: 'your-ethereal-pass' // Replace with actual Ethereal pass
  }
});

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserSchema.findOne({ where: { email } });
  if (!user) {
    return next(new AppError("User with this email does not exist", 404));
  }

  // const otpCode = generateOTP();
  const otpCode = "123456"; // Fixed OTP for testing
  const expiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "10m",
  });

  await OTP.create({
    code: otpCode,
    expiredAt,
    userId: user.id,
  });

  // const mailOptions = {
  //   from: process.env.EMAIL_USERNAME,
  //   to: email,
  //   subject: "Password Reset OTP",
  //   text: `Your OTP for password reset is ${otpCode}. It will expire in 10 minutes.`,
  // };
  // const info = await transporter.sendMail(mailOptions);
  // console.log("Email sent: ", info.messageId);
  // console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));

  res.status(200).json({
    status: "success",
    message: "OTP sent to email",
    resetToken,
  });
});



export const verifyOTP = catchAsyncError(async(req,res,next)=>{
  const {resetToken,otp} = req.body;
  const decoded = jwt.verify(resetToken, process.env.JWT_SECRET_KEY);
  const user= await UserSchema.findByPk(decoded.id);
  if(!user){
    return next(new AppError("Invalid token or user does not exist",401));
  }

  const otpRecord =await OTP.findOne({
    where:{
      userId:user.id,
      code:otp,
      verified:false,
    }
  })

   if (!otpRecord || otpRecord.expiredAt < new Date()) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

   otpRecord.verified = true;
  await otpRecord.save();



  const confirmToken=jwt.sign({
    id:user.id,
    otpId:otpRecord.id
  },process.env.JWT_SECRET_KEY,{
    expiresIn:"10m"
  })

  res.status(200).json({
    status:"success",
    message:"OTP verified successfully",
    confirmToken
  })
})


export const resetPassword=catchAsyncError(async(req,res,next)=>{
  const {confirmToken,newPassword} = req.body;
  const decoded=jwt.verify(confirmToken,process.env.JWT_SECRET_KEY);
  const user= await UserSchema.findByPk(decoded.id);
  if(!user){
    return next(new AppError("Invalid token or user does not exist",401));
  }

  user.password=newPassword;
  await user.save();

  res.status(200).json({
    status:"success",
    message:"Password reset successfully"
  });
})