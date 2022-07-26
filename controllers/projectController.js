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
  const typee = req.query.space_id;
  const project = req.query.project_id;
  const userId = req.user._id;
  const bugType = req.query.bug_type;
  console.log("Hello", userId);

  const user = await User.findById(userId);
console.log(user.role)
  let projects = [];

  if (project && typee) {
    projects = await Project.find({
      space: typee,
      _id: project,
    }).populate(["space", "bugg"]).sort({ createdAt: -1 });
    console.log();
  } else if (typee && !project) {
    projects = await Project.find({ space: typee }).populate(["space", "bugg"]).sort({ createdAt: -1 });;
  } else if (!typee && !project) {
    projects = await Project.find({}).populate(["space", "bugg"]).sort({ createdAt: -1 });;
  }
  //console.log(projects);
  //const agg =await Project.aggregate([{ $match: { bugg: { $in: [bugType] } } }]);
  // console.log(agg)

  let value = [];
  projects.map((x) => {
    //console.log(x);
    x['bugg'].sort((a,b) => b.createdAt - a.createdAt)

    x.bugg.filter((y) => {
      //console.log(typeof (bugType) );
      if (y.type === bugType) {
        value.push(y);
      } else if (y.type === bugType) {
        value.push(y);
      }
      if (y.type === bugType) {
        value.push(y);
      }
    });
  });
  //console.log(projects);
  projects.map((x) => {
   
    value.map((y) => {
      //console.log("y",y.project._id)
      if (JSON.stringify(y.project._id) === JSON.stringify(x._id)) {
        //console.log("HELooo")
        x["bugg"] = value;
      }
    });
  });


console.log(value)
  let a = [];
  let b = [];
  let c = [];
  let skProjet = [];
  let data = [];
  if (user.role === "project_manager") {
    data = projects.filter((x) => {
      console.log("hi", x.createdBy._id);
      return JSON.stringify(x.createdBy._id) === JSON.stringify(userId);
    });
  } else if (user.role === "client") {
    projects.map((x) => {
      if (x.users.length !== 0) {
        x.users.forEach((y) => {
          //console.log("y", y._id, userId);
          if (JSON.stringify(y._id) === JSON.stringify(userId)) {
            console.log("Helo");
            // console.log("x", x);
            data.push(x);
          }
        });
      }
    });
  } else if (user.role === "member") {
    projects.map((x) => {
      x.bugg.map((bug) => {
        bug.users.filter((user, index) => {
          if (JSON.stringify(user._id) === JSON.stringify(userId)) {
            c.push(bug);
          }
        });
      });
    });
    c.map((bug) => {
      let indexNum = data.findIndex((x) => x._id === bug.project._id);
      if (indexNum === -1) {
        data.push({
          _id: bug.project._id,
          name: bug.project.name,
          bugg: [bug],
        });
      } else {
        data[indexNum].bugg = [...data[indexNum].bugg, bug];
      }
    });
  }

  if (a.length !== 0) {
    data = a;
  }

  res.status(200).json({
    data: data,
  });
});




exports.getProjectsByLoggedinUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  // console.log("hello", userId);
  const user = await User.findById(userId);
  // console.log(user);
  const projects = await Project.find({ createdBy: userId })
    .populate("createdBy")
    .populate("bugg").sort({ createdAt: -1 });;
  let arr = [];
  arr = projects;
  let a = [];
  if (user.role === "member") {
    if (projects.length === 0) {
      // console.log("hello");
      const bug = await Bug.find();

      arr = bug;
      arr.map((x) => {
        //console.log(x);
        x.users.map((y) => {
          //console.log(y)
          if (JSON.stringify(y._id) === JSON.stringify(userId)) {
            console.log(x.project);
            a.push(x.project);
          }
        });
      });
    }
  }

  if (a.length !== 0) {
    const unique = [...new Set(a.map((item) => item._id))];
    b = unique;

    arr = await Project.find({ _id: [...new Set(a.map((item) => item._id))] });
  }

  res.status(200).json({
    message: "success",
    data: arr,
  });
});

exports.createProject = catchAsync(async (req, res, next) => {
  const doc = await Project.create({
    name: req.body.name,
    description: req.body.description,
    summary: req.body.summary,
    createdBy: req.user._id,
    users: req.body.users,
    space: req.body.space,
    type: req.body.type,
  }).then(
    async (favorite) => {
      console.log("Favorite marked", favorite);
      const result = await Project.findById(favorite._id);

      console.log(result);
      res.statusCode = 200;
      // res.setHeader("Content-Type", "application/json");
      res.json(result);
    },
    (err) => next(err)
  )
  .catch((err) => next(err));;

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
