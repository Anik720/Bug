const bugModel = require("../models/bugModel");

const AppError = require("./../utils/appError");

const factory = require("./handlerFactory");

exports.getAllBugsUnderProjectManager = async (req, res, next) => {
  const bugs = await bugModel.find({});

  const loggedinUser = req.user;
  console.log(loggedinUser)
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

exports.getAllBug = factory.getAll(bugModel);
exports.createBug = factory.createOne(bugModel);
exports.getBug = factory.getOne(bugModel);
exports.updateBug = factory.updateOne(bugModel);
exports.deleteBug = factory.deleteOne(bugModel);
