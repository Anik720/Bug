const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: false,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["project_manager", "member", "client"],
      default: "client",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    designation:{
      type:String,
      default:null
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    activationLink: {
      type: String,
    },
    socialLogins: [
      {
        type: String,
        enum: ["google", "facebook"],
      },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    activated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre(/^find/, function (next) {
//   next();
// });

// Encrpt the password ad Presave it
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    //  only run if password is modified
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12); // hashing password
  this.passwordConfirm = undefined; // delete passwordConfirm field
  next();
});

userSchema.methods.createAccountActivationLink = function () {
  const activationToken = crypto.randomBytes(32).toString("hex");
  // console.log(activationToken);
  this.activationLink = crypto
    .createHash("sha256")
    .update(activationToken)
    .digest("hex");
  // console.log({ activationToken }, this.activationLink);
  return activationToken;
};

// comparing password
userSchema.methods.correctPassword = async function (
  candidate_Password,
  user_Password
) {
  console.log(candidate_Password);
  return await bcrypt.compare(candidate_Password, user_Password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  console.log(resetToken);

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
