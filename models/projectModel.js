const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please give a project name!"],
    },

    description: {
      type: String,
    },
    summary: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    space: {
      type: mongoose.Schema.ObjectId,
      ref: "Space",
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

projectSchema.virtual("bugg", {
  ref: "Bug",
  foreignField: "project",
  localField: "_id",
});

projectSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
  });

  next();
});
// projectSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "users",
//   });

//   next();
// });
projectSchema.pre(/^find/, function (next) {
  this.populate({
    path: "space",
  });

  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
