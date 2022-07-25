const logsModel = require("../models/logsModel");
const factory = require("./handlerFactory");

exports.getLog = async (req, res, next) => {
  let query = logsModel.findById(req.params.id);

  console.log(query);
  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",

    data: query,
  });
};

exports.getAllLogs = factory.getAll(logsModel);
exports.createLog = factory.createOne(logsModel);
//exports.getProject = factory.getOne(Project, { path: "bugg" });
exports.updateLog = factory.updateOne(logsModel);
exports.deleteLog = factory.deleteOne(logsModel);
