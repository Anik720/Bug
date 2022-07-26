const logsModel = require("../models/logsModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllLogs = catchAsync(async (req, res, next) => {
  const bugId = req.query.bug_id;
  let query;
  if (bugId) {
    query = await logsModel
      .find({ bug: bugId })
      .populate("bug")
      .sort({ createdAt: -1 });
  } else {
    query = await logsModel.find({});
  }
  console.log(query);
  res.status(200).json({
    message: "success",
    data: query,
  });
});

exports.getLog = catchAsync(async (req, res, next) => {
  let query = logsModel.findById(req.params.id);

  console.log(query);
  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",

    data: query,
  });
});

//exports.getAllLogs = factory.getAll(logsModel);
exports.createLog = factory.createOne(logsModel);
//exports.getProject = factory.getOne(Project, { path: "bugg" });
exports.updateLog = factory.updateOne(logsModel);
exports.deleteLog = factory.deleteOne(logsModel);
