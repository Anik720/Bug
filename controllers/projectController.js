const Space = require("../models/spaceModel");
const Project = require("../models/projectModel");
const AppError = require("./../utils/appError");
const Bug = require("./../models/bugModel");
const factory = require("./handlerFactory");
const { MongoClient, ObjectId } = require("mongodb");

exports.getProjectUnderPM = async (req, res, next) => {
  const email = req.query.email;

  const project = await Project.find();
  const result = project.filter((x) => {
    return x.user[0].email === email;
  });

  res.status(201).json({
    message: "Success",
    data: result,
  });
};

exports.getProjecttype = async (req, res, next) => {
  const projects = await Project.find({}).distinct("type");

  res.status(200).json({ data: projects });
};

exports.getProjectType = async (req, res, next) => {
  const type = req.query.space_id;
  const project = req.query.project_id;

  // const spaces = await Space.find({});
  let projects = [];

  if (project) {
    projects = await Project.find({ space: type, _id: project }).populate([
      "space",
      "bugg",
    ]);
  } else {
    projects = await Project.find({ space: type }).populate(["space", "bugg"]);
  }
  console.log(projects);

  // const arr = projects.filter((x) => {
  //   return JSON.stringify(x.space._id) === JSON.stringify(type);
  // });

  console.log();

  //console.log(bugs);
  // const commercial = projects.filter((x) => {
  //   //console.log(typeof( x.type)  );
  //   return x.type === "commercial";
  // });
  // const experimental = projects.filter((x) => {
  //   //console.log(typeof( x.type)  );
  //   return x.type === "experimental";
  // });
  // const internal = projects.filter((x) => {
  //   //console.log(typeof( x.type)  );
  //   return x.type === "internal";
  // });
  //console.log(commercial);
  // if (type === "commercial") {
  //   data = commercial;

  //   data.map((x) => {
  //     //console.log(x._id)
  //     bugs.map((y) => {
  //       //console.log(y.project._id);
  //       if (JSON.stringify(y.project._id) === JSON.stringify(x._id)) {
  //       }
  //     });
  //   });
  // } else if (type === "experimental") {
  //   data = experimental;
  // } else if (type === "internal") {
  //   data = internal;
  // }
  res.status(200).json({
    data: projects,
  });
};

exports.updateProject = async (req, res, next) => {
  const newUsers = req.body.users;

  const previousUser = await Project.findById(req.params.id);
  const a = JSON.stringify();
  const b = a;
  console.log(previousUser);
  let newUserss = [...newUsers, ...previousUser.users];
  console.log(newUserss);

  req.body.users = newUserss;

  const doc = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",

    data: doc,
  });
};
exports.getAllProject = factory.getAll(Project);
exports.careteProject = factory.createOne(Project);
exports.getProject = factory.getOne(Project, { path: "bugg" });
//exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);
