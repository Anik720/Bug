const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");

const authController = require("../controllers/authController");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");

router.route("/project").get(projectController.getProjectUnderPM);
//router.route("/projecttype").get(projectController.getProjecttype);
router.route("/filterbytype").get(protect,projectController.getProjectType);
router.route("/getprojectsbyloggedinuser").get(protect,projectController.getProjectsByLoggedinUser);

router
  .route("/")
  .get(protect,restrictTo("project_manager") ,projectController.getAllProject)
  .post(
    
    projectController.careteProject
  );

router
  .route("/:id")
  .get(projectController.getProject)
  .patch( projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;
