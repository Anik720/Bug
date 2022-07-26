const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    currentStatus: {
      type: String,
    },
    previousStatus: {
      type: String,
      required: [true, "Please give previousStatus!"],
    },
    currentPriority: {
      type: String,
    },
    previousPriority: {
      type: String,
      required: [true, "Please give previousPriority!"],
    },

    comment: {
      type: String,
    },

    bug: {
      type: mongoose.Schema.ObjectId,
      ref: "Bug",
    },
    logUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

logSchema.pre(/^find/, function (next) {
  this.populate({
    path: "bug",
  });

  next();
});
logSchema.pre(/^find/, function (next) {
  this.populate({
    path: "logUser",
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
