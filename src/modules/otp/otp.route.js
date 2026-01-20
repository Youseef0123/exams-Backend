import { Router } from "express";
import {
    forgotPassword,
    resetPassword,
    verifyOTP   
} from "./otp.controller.js";

import {
    validateForgotPassword,
    validateResetPassword,
    validateVerifyOTP

} from "./otp.validation.js";

const otpRouter = Router();


otpRouter.post("/forgot-password",validateForgotPassword,forgotPassword);
otpRouter.post("/verify-otp",validateVerifyOTP,verifyOTP);
otpRouter.post("/reset-password",validateResetPassword,resetPassword);


export default otpRouter;