const validateForgotPassword =(req,res,next)=>{
    const { email } = req.body;
    const error=[];
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        error.push("Valid email is required");
    }
    if(error.length>0){
        return res.status(400).json({
            status:"fail",
            errors:error
        });

    }

    next();
}

const validateVerifyOTP =(req,res,next)=>{
    const { resetToken, otp } = req.body;
    const error=[];
    if(!resetToken){
        error.push("Reset token is required");
    }
    if(!otp|| otp.length!==6 ){
        error.push("Valid 6-digit OTP is required");
    }
    if(error.length>0){
        return res.status(400).json({
            status:"fail",
            errors:error
        });
    }
    next();
}


const validateResetPassword =(req,res,next)=>{
    const { confirmToken, newPassword } = req.body;
    const error=[];
    if(!confirmToken){
        error.push("Confirm token is required");
    }
    if(!newPassword || newPassword.length<6){
        error.push("New password must be at least 6 characters long");
    }
    if(error.length>0){
        return res.status(400).json({
            status:"fail",
            errors:error
        });
    }

    next();
}


export {
    validateForgotPassword,
    validateVerifyOTP,
    validateResetPassword
    
}