const mongoose = require("mongoose");

const spaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Spaces Should have title!"],
      trim: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);



spaceSchema.virtual("spaces", {
  ref: "Project",
  foreignField: "Project",
  localField: "_id",
});

const Space = mongoose.model("Space", spaceSchema);

module.exports = Space;
