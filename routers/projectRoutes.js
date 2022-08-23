const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");

const authController = require("../controllers/authController");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");
router.route("/adduser/:id").patch(protect,restrictTo("project_manager"), projectController.addUser);
router.route("/project").get(projectController.getProjectUnderPM);
//router.route("/projecttype").get(projectController.getProjecttype);
router.route("/filterbytype").get(protect,restrictTo("project_manager","member","client") ,projectController.getProjectType);

//router.route("/adduser/:id").patch(protect, projectController.addUser);
router
  .route("/getprojectsbyloggedinuser")
  .get(protect,restrictTo("project_manager","member","client") , projectController.getProjectsByLoggedinUser);

router
  .route("/")
  .get(protect,restrictTo("project_manager","member","client") ,projectController.getAllProject)
  .post(protect, restrictTo("project_manager"),projectController.createProject);

router
  .route("/:id")
  .get(protect,restrictTo("project_manager") , projectController.getProject)
  .patch(protect,restrictTo("project_manager") , projectController.updateProject)
  .delete(protect,restrictTo("project_manager") , projectController.deleteProject);

module.exports = router;
