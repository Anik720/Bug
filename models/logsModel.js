const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
{
    currentStatus: {
        type: String,
        required: true,
      },
    previousStatus: {
        type: String,
        required: true,
      },
    currentPriority: {
        type: String,
        required: true,
      },
    previousPriority: {
        type: String,
        required: true,
      },
      bug: {
        type: mongoose.Schema.ObjectId,
        ref: "Bug",
      },
      

}
  
);

// spaceSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "createdBy",
//     select: "-__v -user",
//   });

//   next();
// });

// spaceSchema.virtual("spaces", {
//   ref: "Project",
//   foreignField: "space",
//   localField: "_id",
// });

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
