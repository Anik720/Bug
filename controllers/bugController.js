const bugModel = require("../models/bugModel");
const logsModel = require("../models/logsModel");

const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");


const factory = require("./handlerFactory");

exports.getAllBugsUnderProjectManager = async (req, res, next) => {
  const bugs = await bugModel.find({});

  const loggedinUser = req.user;
  console.log(loggedinUser);
  const arr = [];
  bugs.forEach((x) => {
    if (
      JSON.stringify(x?.project.createdBy._id) ===
      JSON.stringify(loggedinUser._id)
    ) {
      arr.push(x);
    }
  });

  res.status(200).json({ data: arr });
};

exports.updateBug = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user_id = req.user._id;
  console.log(id);
  const data = await bugModel.findById({_id:id});
  const { status, priority } = data;
  console.log(id);

  const value = await logsModel.create({
    currentStatus: req.body.status,
    previousStatus: status,
    currentPriority: req.body.priority,
    previousPriority: priority,
    bug: id,
    logUer: user_id,
  });
  //sconsole.log(value);
  const doc = await bugModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.getAllBug = factory.getAll(bugModel);
exports.createBug = factory.createOne(bugModel);
exports.getBug = factory.getOne(bugModel);
//exports.updateBug = factory.updateOne(bugModel);
exports.deleteBug = factory.deleteOne(bugModel);
