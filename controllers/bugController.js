const Bug = require("../models/bugModel");
const bugModel = require("../models/bugModel");
const logsModel = require("../models/logsModel");
const { MongoClient, ObjectId } = require("mongodb");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const User = require("../models/User");

const factory = require("./handlerFactory");
const { findById } = require("../models/bugModel");

exports.getAllBugsUnderProjectManager = catchAsync(async (req, res, next) => {
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
});
exports.addUser = catchAsync(async (req, res, next) => {
  const newUsers = req.body.users;
  //console.log(newUsers);

  const bug = await Bug.findById(req.params.id);
  // const data = await bugModel.findById({ _id: req.params.id });
  // const { status, priority, deadline ,} = data;
  let doc;
  // console.log(bug.users)
  // console.log()
  let index = bug.users.findIndex(
    (user) => JSON.stringify(user._id) === JSON.stringify(newUsers)
  );
  console.log("Hello", index);

  if (index === -1) {
    // const data=[users,doc.users]

    const updateUsers = [...bug.users, newUsers];
    console.log("true");
    // req.body.users =  updateUsers;
    doc = bug;
    doc.users = updateUsers;
    doc.save();
    const log = await logsModel.create({
      addedUser: req.body.users,
      logUser: req.user._id,
      bug: req.params.id,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    return res.status(200).json({
      status: "Success",

      data: doc,
    });
  } else {
    console.log("false");
    doc = bug;
    return res.status(501).json({
      status: "User already availabe!",

      data: doc,
    });
  }
});

// exports.getAllBug=catchAsync(async(req,res,next)=>{
// const bug=req.query.bug_id;
// if(bug){

// }
//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     results: doc.length,

//     data: doc,
//   });

// })

exports.getAllBug = catchAsync(async (req, res, next) => {
  const userId = req.query.user_id;
  console.log(userId);
  let data;
  if (userId) {
    data = await Bug.find({ project: userId }).populate("project");
    //console.log(bugs);
  } else {
    data = await Bug.find({});
  }

  res.status(200).json({
    status: "success",

    data: data,
  });
});

exports.getBugByLoggedInUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  //console.log(userId)
  // console.log("hello", userId);
  const user = await User.findById(userId);
  console.log(user);

  const bug = await Bug.find();
  //   .populate("project")
  //  const bug2=   await Bug.find({_id:userId}).populate("createdBy")

  //  console.log(bug);
  let data;
  let data2;
  // data = bug.filter(async (x) => {
  //   if (JSON.stringify(x.project.createdBy._id) === JSON.stringify(userId)) {
  //     console.log("Hello")
  //     return JSON.stringify(x.project.createdBy._id) === JSON.stringify(userId);
  //   } else {
  //     console.log("Hi")
  //     data2 = await Bug.find({ users: userId }).populate("project");
  //     console.log(data2);
  //     // res.status(200).json({
  //     //   message: "success",
  //     //   data: data2,
  //     // });
  //   }
  // });
  var a = [];
  if (user.role === "project_manager") {

    data = bug.filter((x) => {
      return JSON.stringify(x.project.createdBy._id) === JSON.stringify(userId);
    });
  } else {
    data = bug.map((x) => {
      // console.log("Hello",);
      if (x.project.users.length !== 0) {
        // x.project.users.forEach((y) => {
        //   if (JSON.stringify(y) === JSON.stringify(userId)) {
        //     a.push(x);
        //   }
        // });
        //console.log(x.users);
        if (x.users.length !== 0) {
          x.users.forEach(y=>{
            console.log(y._id)
            if (JSON.stringify(y._id) === JSON.stringify(userId)){
              console.log("Helo")
              a.push(x)
            }
          })
        }
      }
    });
  }
if(a.length!==0){
  data=a
}
  //console.log(data);
  res.status(200).json({
    message: "success",
    data: data,
  });
});

exports.allBugCurrentStatus=catchAsync(async(req,res,next)=>{
  
const solveBugs=await Bug.find({status:"completed"})
const unsolveBugs=await Bug.find({status:{$ne:"completed"}})
console.log(solveBugs.length)
console.log(unsolveBugs.length)

res.status(200).json({message: "success",
data:{
solved:solveBugs.length,
unsolveBugs:unsolveBugs.length,
}})


})







exports.updateBug = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user_id = req.user._id;
  console.log(id);
  const data = await bugModel.findById({ _id: id });
  const { status, priority, deadline } = data;
  console.log(id);

  const value = await logsModel.create({
    currentStatus: req.body.status,
    previousStatus: status,
    currentPriority: req.body.priority,
    previousPriority: priority,
    currentDeadline: req.body.deadline,
    previousDeadline: deadline,
    bug: id,
    logUser: user_id,
    comment: req.body.comment || "",
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

exports.createBug = catchAsync(async (req, res, next) => {
  const doc = await Bug.create({
    priority: req.body.priority,
    file: req.body?.file,
    status: req.body.status,
    issueTitle: req.body.issueTitle,
    issueDescription: req.body.issueDescription,
    project: req.body.project,
    createdBy: req.user._id,
    deadline: req.body.deadline,
  })
    .then(
      async (favorite) => {
        console.log("Favorite marked", favorite);
        const result = await Bug.findById(favorite._id).populate("project");

        console.log(result);
        res.statusCode = 200;
        // res.setHeader("Content-Type", "application/json");
        res.json(result);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));

  // res.status(201).json({
  //   status: "success",

  //   data: doc,
  // });
});

//exports.getAllBug = factory.getAll(bugModel);
//exports.createBug = factory.createOne(bugModel);
exports.getBug = factory.getOne(bugModel);
//exports.updateBug = factory.updateOne(bugModel);
exports.deleteBug = factory.deleteOne(bugModel);
