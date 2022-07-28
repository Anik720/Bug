const express = require("express");

const router = express.Router();

const bugController = require("../controllers/bugController");

const authController = require("../controllers/authController");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");

router.route("/adduser/:id").patch(protect, bugController.addUser);
router
  .route("/getallbugsunderprojectmanager")
  .get(protect, bugController.getAllBugsUnderProjectManager);

router
  .route("/")
  .get(bugController.getAllBug)
  .post(protect, bugController.createBug);

router
  .route("/:id")
  .get(bugController.getBug)
  .patch(protect, restrictTo("project_manager"), bugController.updateBug)
  .delete(bugController.deleteBug);
module.exports = router;
