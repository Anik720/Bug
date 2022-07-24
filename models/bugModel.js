const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },

    status: {
      type: String,
      enum: ["inprogress", "inreview", "completed"],
      default: "inprogress",
    },
    issueTitle: {
      type: String,
      required: true,
    },
    issueDescription: {
      type: String,
      default: null,
    },

    project: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
    },

    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

bugSchema.pre(/^find/, function (next) {
  this.populate({
    path: "project",
  });

  next();
});

bugSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
    select: "-__v -user",
  });

  next();
});
const Bug = mongoose.model("Bug", bugSchema);

module.exports = Bug;
