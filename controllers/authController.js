const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const sendMail = require("../utils/email");
var redis = require("redis");
var JWTR = require("jwt-redis").default;
var redisClient = redis.createClient();
var jwtr = new JWTR(redisClient);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = catchAsync((user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "development") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  if (!user) {
    res.status(statusCode).json({
      status: "failed",
    });
  }
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  console.log(req.body.email);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  // const url = `${req.protocol}://${req.get("host")}/me`;
  //console.log(url);
  //await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return res.status(403).json({
      message: "Please provide email or passwordd",
    });
    //return next(new AppError("Please provide email and password!", 400));
  }
  console.log(req.body);
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  console.log("usee", user);
  if (!user || !(await user.correctPassword(password, user.password))) {
   return res.status(403).json({
      message: "Incorrect email or password",
    });
    //return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  const id = req.params.id;
  let token;
  const authHeader = req.headers["authorization"];
  token = req.headers.authorization.split(" ")[1];
  //console.log(authHeader)
  jwt.sign({ id }, "anik1234", { expiresIn: "1s" }, (logout, err) => {
    if (logout) {
      res.send({ msg: "You have been Logged Out" });
    } else {
      res.send({ msg: "Error" });
    }
  });
};

exports.confirmMail = catchAsync(async (req, res) => {
  // 1 Hash The Avtivation Link
  // console.log(req.params.activationLink);

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.activationLink)
    .digest("hex");

  // console.log(hashedToken);

  const user = await User.findOne({
    activationLink: hashedToken,
  });

  if (!user) return next(new AppError(`Activation Link Invalid or Expired !`));
  // 3 Activate his Account
  user.activated = true;
  user.activationLink = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "Success",
    message: "Account has been Activated Successfully !",
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 Check if Email Exists
  const { email } = req.body;

  if (!email) return next(new AppError(`Plz provide Email with request`, 400));

  // 2 Check If User Exists with this email
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user)
    return next(
      new AppError(`No User Found against this Email : ${email}`, 400)
    );

  // 3 Create Password Reset Token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 4 Send it to Users Email
  // const resetURL = `localhost:5000/api/users/resetPassword/${resetToken}`;
  let resetURL = `${req.headers.origin}/resetPassword/${resetToken}`;

  //    = `${req.protocol}://${req.get(
  //     'host'
  //   )}/api/users/resetPassword/${resetToken}`;

  const message = `Forgot Password . Update your Password at this link ${resetURL} if you actually request it
   . If you did NOT forget it , simply ignore this Email`;

  sendMail({
    email,
    message,
    subject: "Your Password reset token (will expire in 20 minutes)",
    user,
    template: "forgotPassword.ejs",
    url: resetURL,
  });

  res.status(200).json({
    status: "Success",
    message: `Forget password link successfully sent to your email : ${email}`,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 Find the  user based on Token

  // console.log(req.params.resetToken);

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  // console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // 2 Check if user still exists and token is NOT Expired
  if (!user)
    return next(new AppError(`Reset Password Link Invalid or Expired !`));

  // 3 Change Password and Log the User in
  const { password, passwordConfirm } = req.body;

  // console.log('passwords are', password, passwordConfirm);

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const token = signToken(user._id);

  // * If you don't want the user to be logged In after pass reset
  // * Remove token from respone
  res.status(200).json({
    status: "success",
    token,
  });
});

//    Update Password for only logged in user

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  const user = await User.findById(req.user.id).select("+password");
  console.log(user);

  // 2) check if posted current Password is Correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    // currentpass,db pass
    return next(new AppError(" Your current password is wrong", 401));
  }

  // 3) if so update the  password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4) Log user in , send JWT
  createsendToken(user, 200, res);
});
