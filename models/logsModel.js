const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    currentStatus: {
      type: String,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    currentPriority: {
      type: String,
    },
    previousPriority: {
      type: String,
      required: true,
    },

    comment: {
      type: String,
    },

    bug: {
      type: mongoose.Schema.ObjectId,
      ref: "Bug",
    },
    logUer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
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
    path: "logUer",
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
