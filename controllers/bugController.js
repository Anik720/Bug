const multer = require("multer");
const sharp = require("sharp");
const Bug = require("../models/bugModel");
const bugModel = require("../models/bugModel");
const logsModel = require("../models/logsModel");
const { MongoClient, ObjectId } = require("mongodb");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const User = require("../models/User");

const factory = require("./handlerFactory");
const { findById } = require("../models/bugModel");
const { JsonWebTokenError } = require("jsonwebtoken");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
});

exports.uploadImages = upload.fields([
  { name: "images", name: "files", maxCount: 100 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeImages = catchAsync(async (req, res, next) => {
  if (!req.files.images) {
    req.body.files = req.files.files;

    return next();
  }

  // 1) Cover image
  // req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  // await sharp(req.files.imageCover[0].buffer)
  //   .resize(2000, 1333)
  //   .toFormat('jpeg')
  //   .jpeg({ quality: 90 })
  //   .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `bug-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/bugs/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

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
exports.userAction = catchAsync(async (req, res, next) => {
  const newUsers = req.body.users;

  console.log("newUsers", newUsers);

  const action = req.query.action;
  let doc;
  const bug = await Bug.findById(req.params.id);

  if (action === "remove") {
    const data = bug.users.filter((x) => {
      return JSON.stringify(x._id) !== JSON.stringify(newUsers);
    });
    console.log("data", data);
    bug.users = data;
    doc = bug;
    doc.save();
    return res.status(200).json({
      status: "User Deleted!",

      data: doc,
    });
  }

  let index = bug.users.findIndex(
    (user) => JSON.stringify(user._id) === JSON.stringify(newUsers)
  );
  console.log("Hello", bug);

  if (action === "add") {
    if (index === -1) {
      const updateUsers = [...bug.users, newUsers];
      console.log("true");

      doc = bug;
      doc.users = updateUsers;
      doc.save();
      const log = await logsModel
        .create({
          addedUser: req.body.users,
          logUser: req.user._id,
          bug: req.params.id,
        })
        .then(
          async (favorite) => {
            console.log("Favorite marked", favorite);
            const result = await Bug.findById(req.params.id).populate("users");

            console.log(result);
            //res.statusCode = 200;
            // res.setHeader("Content-Type", "application/json");
            //res.json(result);
            return res.status(200).json({
              status: "Success",

              data: result,
            });
          },
          (err) => next(err)
        )
        .catch((err) => next(err));

      if (!doc) {
        return next(new AppError("No document found with that ID", 404));
      }
    } else {
      console.log("false");
      doc = bug;
      return res.status(501).json({
        status: "User already availabe!",

        data: doc,
      });
    }
  }
});

exports.getAllBug = catchAsync(async (req, res, next) => {
  const userId = req.query.user_id;
  console.log(userId);
  let data;
  if (userId) {
    data = await Bug.find({ project: userId })
      .populate("project")
      .sort({ createdAt: -1 });
  } else {
    data = await Bug.find({}).sort({ createdAt: -1 });
  }

  res.status(200).json({
    status: "success",
    result: data.length,
    data: data,
  });
});

exports.getBugByLoggedInUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  console.log(user);

  const bug = await Bug.find();

  let data;
  let data2;

  var a = [];
  if (user.role === "project_manager") {
    data = bug.filter((x) => {
      return JSON.stringify(x.project.createdBy._id) === JSON.stringify(userId);
    });
  } else {
    data = bug.map((x) => {
      // console.log("Hello",);
      if (x.project.users.length !== 0) {
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
  if (a.length !== 0) {
    data = a;
  }
  //console.log(data);
  res.status(200).json({
    message: "success",
    data: data,
  });
});

exports.getUserFromProjectBug = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  console.log(userId);
  let data = [];

  const bug = await Bug.find();

  bug.map((x) => {
    // console.log("Hello",);
    if (x.project.users.length !== 0) {
      x.project.users.forEach((y) => {
        if (JSON.stringify(y) === JSON.stringify(userId)) {
          data.push(x);
        }
      });
    }
  });

  res.status(200).json({
    message: "success",
    results: data.length,
    data: data,
  });
});

exports.allBugCurrentStatus = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const bugs = await Bug.find();
  //console.log(bugs);
  const user = await User.findById(userId);
  let solveBugs = [];
  let unsolvedBugs = [];
  //console.log(user.role);
  const role = user.role;

  // bugs.map((x) => {
  //   if (x.project.users.length !== 0) {
  //     console.log(x.users.role)
  //     x.project.users.forEach((y) => {

  //       if (
  //         JSON.stringify(y) === JSON.stringify(userId) &&
  //         x.status === "completed"
  //       ) {
  //         solveBugs.push(x);
  //       } else if (
  //         JSON.stringify(y) === JSON.stringify(userId) &&
  //         x.status !== "completed"
  //       ) {
  //         unsolvedBugs.push(x);
  //       }
  //     });
  //   }
  // });

  if (role === "client") {
    bugs.map((x) => {
      console.log(x.project.users);
      if (x.project.users.length !== 0) {
        x.project.users.map((y) => {
          if (
            JSON.stringify(y) === JSON.stringify(userId) &&
            x.status === "completed"
          ) {
            solveBugs.push(x);
          } else if (
            JSON.stringify(y) === JSON.stringify(userId) &&
            x.status !== "completed"
          ) {
            unsolvedBugs.push(x);
          }
        });
      }
    });
  }

  if (role === "member") {
    console.log("member");
    bugs.map((x) => {
      console.log(x.users);
      if (x.users.length !== 0) {
        x.users.map((y) => {
          if (
            JSON.stringify(y._id) === JSON.stringify(userId) &&
            x.status === "completed"
          ) {
            solveBugs.push(x);
          } else if (
            JSON.stringify(y._id) === JSON.stringify(userId) &&
            x.status !== "completed"
          ) {
            console.log("Helo");

            unsolvedBugs.push(x);
          }
        });
      }
    });
  }

  res.status(200).json({
    message: "Success",
    solvedBugs: solveBugs.length,
    unsolvedBugs: unsolvedBugs.length,
  });
});

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
    type: req.body.type,
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
});

//exports.getAllBug = factory.getAll(bugModel);
//exports.createBug = factory.createOne(bugModel);
exports.getBug = factory.getOne(bugModel);
//exports.updateBug = factory.updateOne(bugModel);
exports.deleteBug = factory.deleteOne(bugModel);
