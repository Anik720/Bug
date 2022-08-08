const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
    file: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["inprogress", "inreview", "completed", "rejected"],
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

    deadline: {
      type: Date,
    },
    project: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
    },

    type: {
      type: String,
      enum: ["bug", "change_request", "add_feature"],
      default: "bug",
    },
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: [],
      },
    ],
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
bugSchema.pre(/^find/, function (next) {
  this.populate({
    path: "users",
    select: "-__v -user",
  });

  next();
});
const Bug = mongoose.model("Bug", bugSchema);

module.exports = Bug;
