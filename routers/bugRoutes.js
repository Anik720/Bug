const express = require("express");

const router = express.Router();

const bugController = require("../controllers/bugController");

const authController = require("../controllers/authController");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");

router.route("/userAction/:id").patch(protect, bugController.userAction);

router
  .route("/getuserfromprojectbug")
  .get(protect, bugController.getUserFromProjectBug);
router
  .route("/getallbugsunderprojectmanager")
  .get(protect, bugController.getAllBugsUnderProjectManager);

router
  .route("/getbugbyloggedinuser")
  .get(protect, bugController.getBugByLoggedInUser);
router
  .route("/getbugbyloggedinuserproid")
  .get(protect, bugController.getBugByLoggedInUserProId);
router
  .route("/allbugcurrentstatus")
  .get(protect, bugController.allBugCurrentStatus);

router.route("/").get(bugController.getAllBug).post(
  protect,

  bugController.createBug
);

router
  .route("/:id")
  .get(bugController.getBug)
  .patch(
    protect,

    bugController.updateBug
  )
  .delete(bugController.deleteBug);
module.exports = router;
