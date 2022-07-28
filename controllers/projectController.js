const Space = require("../models/spaceModel");
const Project = require("../models/projectModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const Bug = require("./../models/bugModel");
const factory = require("./handlerFactory");
const { MongoClient, ObjectId } = require("mongodb");
const { crossOriginResourcePolicy } = require("helmet");

exports.getProjectUnderPM = catchAsync(async (req, res, next) => {
  const email = req.query.email;

  const project = await Project.find();
  const result = project.filter((x) => {
    return x.user[0].email === email;
  });

  res.status(201).json({
    message: "Success",
    data: result,
  });
});

exports.getProjecttype = catchAsync(async (req, res, next) => {
  const projects = await Project.find({}).distinct("type");

  res.status(200).json({ data: projects });
});

exports.getProjectType = catchAsync(async (req, res, next) => {
  const type = req.query.space_id;
  const project = req.query.project_id;
  const userId = req.user._id;
  console.log("Hello", userId);

  // const spaces = await Space.find({});
  let projects = [];

  if (project) {
    projects = await Project.find({
      space: type,
      _id: project,
    }).populate(["space", "bugg"]);
  } else {
    projects = await Project.find({ space: type }).populate(["space", "bugg"]);
  }
  //console.log(projects);

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
});

exports.getProjectsByLoggedinUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  console.log("hello", userId);

  const projects = await Project.find({ createdBy: userId }).populate(
    "createdBy"
  );
  let arr;
  arr = projects;

  if (projects.length === 0) {
    const project = await Project.find({ users: userId });
    arr = project;
  }
  console.log(projects);
  res.status(200).json({
    message: "success",
    data: arr,
  });
});

// exports.addUser = catchAsync(async (req, res, next) => {
//   const newUsers = req.body.users;
//   console.log(newUsers);

//   const project = await Project.findById(req.params.id);

//   let doc;

//   if (project.users.indexOf(newUsers) === -1) {
//     // const data=[users,doc.users]

//     const updateUsers = [...project.users, newUsers];
//     // req.body.users =  updateUsers;
//     doc = await Project.findById(req.params.id);
//     doc.users=updateUsers
//     doc.save()

//     if (!doc) {
//       return next(new AppError("No document found with that ID", 404));
//     }
//     return res.status(200).json({
//       status: "Success",

//       data: doc,
//     });
//   } else {
//     doc = project;
//     return res.status(501).json({
//       status: "User already availabe!",

//       data: doc,
//     });
//   }
// });

exports.createProject = catchAsync(async (req, res, next) => {
  const doc = await Project.create({
    name: req.body.name,
    description: req.body.description,
    summary: req.body.summary,
    createdBy: req.user._id,
    users: req.body.users,
    space: req.body.space,
  });

  res.status(201).json({
    status: "success",

    data: doc,
  });
});

exports.getAllProject = factory.getAll(Project);
//exports.careteProject = factory.createOne(Project);
exports.getProject = factory.getOne(Project, { path: "bugg" });
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);
