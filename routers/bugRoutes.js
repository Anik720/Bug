const express = require("express");

const router = express.Router();

const bugController = require("../controllers/bugController");

const authController = require("../controllers/authController");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");

router
  .route("/userAction/:id")
  .patch(protect, restrictTo("project_manager"), bugController.userAction);

router
  .route("/getuserfromprojectbug")
  .get(
    protect,
    restrictTo("project_manager"),
    bugController.getUserFromProjectBug
  );
router
  .route("/getallbugsunderprojectmanager")
  .get(
    protect,
    restrictTo("project_manager"),
    bugController.getAllBugsUnderProjectManager
  );

router
  .route("/getbugbyloggedinuser")
  .get(protect, bugController.getBugByLoggedInUser);
router
  .route("/getbugbyloggedinuserproid")
  .get(protect, bugController.getBugByLoggedInUserProId);
router
  .route("/allbugcurrentstatus")
  .get(protect, bugController.allBugCurrentStatus);
router.route("/practice/:id").get(protect, bugController.practice);

router.route("/").get(protect,restrictTo("project_manager") , bugController.getAllBug).post(
  protect,
  restrictTo("project_manager") ,
  bugController.createBug
);

router
  .route("/:id")
  .get(protect,restrictTo("project_manager") ,bugController.getBug)
  .patch(
    protect,
    restrictTo("project_manager") ,
    bugController.updateBug
  )
  .delete(protect,restrictTo("project_manager") ,bugController.deleteBug);
module.exports = router;
