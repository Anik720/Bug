const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    currentStatus: {
      type: String,
      default: null,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    currentPriority: {
      type: String,
      default: null,
    },
    previousPriority: {
      type: String,
      default: null,
    },
    currentDeadline: {
      type: String,
      default: null,
    },
    previousDeadline: {
      type: String,
      default: null,
    },
    addedUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null,
    },
    comment: {
      type: String,
      default: "",
    },

    bug: {
      type: mongoose.Schema.ObjectId,
      ref: "Bug",
    },
    logUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    deleteUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// logSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "bug",
//   });

//   next();
// });
logSchema.pre(/^find/, function (next) {
  this.populate({
    path: "logUser",
  });

  next();
});
logSchema.pre(/^find/, function (next) {
  this.populate({
    path: "deleteUser",
  });

  next();
});
logSchema.pre(/^find/, function (next) {
  this.populate({
    path: "addedUser",
  });

  next();
});

// logSchema.virtual("spaces", {
//   ref: "Project",
//   foreignField: "space",
//   localField: "_id",
// });

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
