const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const BlackToken = require("../models/blackListedTokenModel");

//  Protecting Routes
module.exports = catchAsync(async (req, res, next) => {
  // 1- get the token check if exist
  //   const token=req.header('Authorization').replace('Bearer ','')
  let token;
  const refreshToken=req.body.refreshToken


  console.log(req.headers.authorization === true);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }
  if (!token) {
    return next(new AppError("you are not login ", 401));
  }
  console.log(`process.env.JWT_SECRET`, process.env.JWT_SECRET);
  // 2- validate the token



  //console.log(findToken)

  // if (findToken.length || findToken2.length) {
  //   return next(new AppError("Logged in failed", 401));
  // }
  // const decode = await promisify(jwt.verify)(
  //   token,
  //   process.env.JWT_SECRET,
  //   function(err, decoded) {
  //     if (err) {

  //       console.log(err)
  //       /*
  //         err = {
  //           name: 'TokenExpiredError',
  //           message: 'jwt expired',
  //           expiredAt: 1408621000
  //         }
  //       */
  //     }
  //   }
  // );
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
        value:false
      });
    } else {
      decode = decoded;
    }
  });

  console.log("decode", decode);
  // 3- check user exits
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(new AppError("Logged in failed", 401));
  }

  req.user = currentUser;
  next();
});
