const Space = require("../models/spaceModel");
const Project = require("../models/projectModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const Bug = require("./../models/bugModel");
const factory = require("./handlerFactory");
const { MongoClient, ObjectId } = require("mongodb");
const { crossOriginResourcePolicy } = require("helmet");
const User = require("../models/User");
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

exports.addUser = catchAsync(async (req, res, next) => {
  const newUsers = req.body.users;
  //console.log(newUsers);

  const project = await Project.findById(req.params.id);
  // const data = await bugModel.findById({ _id: req.params.id });
  // const { status, priority, deadline ,} = data;
  let doc;
  // console.log(bug.users)
  // console.log()
  let index = project.users.findIndex(
    (user) => JSON.stringify(user._id) === JSON.stringify(newUsers)
  );
  console.log("Hello", index);

  if (index === -1) {
    // const data=[users,doc.users]

    const updateUsers = [...project.users, newUsers];
    console.log("true");
    // req.body.users =  updateUsers;
    doc = project;
    doc.users = updateUsers;
    doc.save();
    // const log = await logsModel.create({
    //   addedUser: req.body.users,
    //   logUser: req.user._id,
    //   bug: req.params.id,
    // });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    return res.status(200).json({
      status: "Success",

      data: doc,
    });
  } else {
    console.log("false");
    doc = project;
    return res.status(501).json({
      status: "User already availabe!",

      data: doc,
    });
  }
});

exports.getProjectType = catchAsync(async (req, res, next) => {
  const type = req.query.space_id;
  const project = req.query.project_id;
  const userId = req.user._id;
  console.log("Hello", type);

  const user = await User.findById(userId);
  //console.log(user);

  // const spaces = await Space.find({});
  let projects = [];

  if (project && type) {
    projects = await Project.find({
      space: type,
      _id: project,
    }).populate(["space", "bugg"]);
    console.log();
  } else if (type && !project) {
    projects = await Project.find({ space: type }).populate(["space", "bugg"]);
  } else if (!type && !project) {
    projects = await Project.find({}).populate(["space", "bugg"]);
  }

  let a = [];
  if (user.role === "project_manager") {
    data = projects.filter((x) => {
      console.log("hi", x.createdBy._id);
      return JSON.stringify(x.createdBy._id) === JSON.stringify(userId);
    });
  } else {
    data = projects.map((x) => {
      console.log("Hello", x.users);
      if (x.users.length !== 0) {
        // x.project.users.forEach((y) => {
        //   if (JSON.stringify(y) === JSON.stringify(userId)) {
        //     a.push(x);
        //   }
        // });
        //console.log(x.users);
        if (x.users.length !== 0) {
          x.users.forEach((y) => {
            console.log(y._id);
            if (JSON.stringify(y._id) === JSON.stringify(userId)) {
              console.log("Helo");
              a.push(x);
            }
          });
        }
      }
    });
  }
  //console.log(projects);

  // const arr = projects.filter((x) => {
  //   return JSON.stringify(x.space._id) === JSON.stringify(type);
  // });

  console.log();
  if (a.length !== 0) {
    data = a;
  }
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
    data: data,
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

exports.getUserFromProjectBug = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  console.log(userId)

  const bug = await Bug.find({users:userId}).populate("project")


  // let arr=[]

  // project.forEach(async x=>{
  //   console.log(x)
  //   const bug=await Bug.find({_id:x}).populate("project")
  
  //   arr.push(bug)
  // })

  console.log(bug);
  res.status(200).json({
    message:"success",
    data:bug
  })
});

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
