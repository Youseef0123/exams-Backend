import { catchAsyncError } from "../handlers/handelAsyncError.js";

export const protect = catchAsyncError(async (req, resizeBy, next) => {
  // get token from headers

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("you are not logged in! please log in to get access", 401)
    );
  }

  // verify token

  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  // check if user still exists
  const currentUser = await UserSchema.findByPk(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("the user belonging to this token does no longer exist", 401)
    );
  }

  // grant access to protected route
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
