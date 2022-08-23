const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const Email = require("./../utils/email");
const BlackToken = require("../models/blackListedTokenModel");
const WhiteToken = require("../models/whiteListTokenModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signTokenRefresh = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
  });
};

const createSendToken = catchAsync(async (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signTokenRefresh(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "development") cookieOptions.secure = true;

  //res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  if (!user) {
    res.status(statusCode).json({
      status: "failed",
    });
  }

  const WhiteTokenn = await WhiteToken.create({
    userId: user._id,
    refreshToken: refreshToken,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    refreshToken,
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
  //console.log(req.body);
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  //console.log("usee", user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(403).json({
      message: "Incorrect email or password",
    });
    //return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  //let refreshToken = req.body.refreshToken;

  const previousTken = await BlackToken.create({ token });
  //await BlackToken.create({ token: refreshToken });

  res.status(200).json({
    message: "success",
  });
});

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

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   // 1 Check if Email Exists
//   const { email } = req.body;

//   if (!email) return next(new AppError(`Plz provide Email with request`, 400));

//   // 2 Check If User Exists with this email
//   const user = await User.findOne({
//     email: email.toLowerCase(),
//   });

//   if (!user)
//     return next(
//       new AppError(`No User Found against this Email : ${email}`, 400)
//     );

//   // 3 Create Password Reset Token
//   const resetToken = user.createPasswordResetToken();

//   await user.save({ validateBeforeSave: false });

//   // 4 Send it to Users Email
//   // const resetURL = `localhost:5000/api/users/resetPassword/${resetToken}`;
//   let resetURL = `${req.headers.origin}/resetPassword/${resetToken}`;

//   //    = `${req.protocol}://${req.get(
//   //     'host'
//   //   )}/api/users/resetPassword/${resetToken}`;

//   const message = `Forgot Password . Update your Password at this link ${resetURL} if you actually request it
//    . If you did NOT forget it , simply ignore this Email`;

//   sendMail({
//     email,
//     message,
//     subject: "Your Password reset token (will expire in 20 minutes)",
//     user,
//     template: "forgotPassword.ejs",
//     url: resetURL,
//   });

//   res.status(200).json({
//     status: "Success",
//     message: `Forget password link successfully sent to your email : ${email}`,
//   });
// });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(resetToken);
  // 3) Send it to user's email
  // try {
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  await new Email(user, resetURL).sendPasswordReset();

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
  // } catch (err) {
  //   user.passwordResetToken = undefined;
  //   user.passwordResetExpires = undefined;
  //   await user.save({ validateBeforeSave: false });

  //   return next(
  //     new AppError('There was an error sending the email. Try again later!'),
  //     500
  //   );
  // }
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
  const token = req.headers.authorization.split(" ")[1];

  const refreshToken = req.body.refreshToken;

  // 1) get user from collection
  const user = await User.findById(req.user.id).select("+password");
  console.log(user);

  // 2) check if posted current Password is Correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    // currentpass,db pass
    return next(new AppError(" Your current password is wrong", 401));
  }

  // 3) if so update the  password
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError("Password are not same", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  const findWhiteToken = await WhiteToken.deleteMany({
    userId: req.user.id,
  });

  // 4) Log user in , send JWT
  res.status(200).json({
    message: "success",
  });
});

exports.getNewToken = catchAsync(async (req, res, next) => {
  const refreToken = req.body.refreshToken;

  let decode;
  let token;
  let user;
  let value;
  jwt.verify(refreToken, process.env.JWT_SECRET, async function (err, decoded) {
    if (err) {
      res.status(401).json({
        message: "Logged in failed",
      });
    } else {
      decode = decoded;
      const result = await WhiteToken.find({ userId: decode.id });
      console.log("result", result);
      if (result.length) {
        token = jwt.sign({ id: decode.id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
        user = await User.findById({ _id: decode.id });
        console.log(token, user);
        res.status(200).json({
          message: "success",
          token: token,
          data: { user },
        });
      } else {
        token = null;
        user = null;
        res.status(200).json({
          message: "success",
          token: token,
          data: { user },
        });
      }
    }
  });
  console.log(user);

  // console.log(token);
});

exports.isTokenExpire = catchAsync(async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  let decode;
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      /*
      err = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
        expiredAt: 1408621000
        
      }
    */

      res.status(401).json({
        message: "Logged in failed",
      });
    } else {
      decode = decoded;
    }
  });
  if (decode) {
    value = true;
  } else {
    value = false;
  }
  console.log("decode", decode);

  res.status(200).json({
    message: "success",
    value,
  });
});
