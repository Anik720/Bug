const Space = require("../models/spaceModel");
const factory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

exports.getAllSpace = factory.getAll(Space);
exports.careteSpace = factory.createOne(Space);
exports.getSpace = factory.getOne(Space, { path: "spaces" });
exports.updateSpace = factory.updateOne(Space);
exports.deleteSpace = factory.deleteOne(Space);
