const express = require("express");

const router = express.Router();

const spaceController = require("../controllers/spaceController");

const authController = require("../controllers/authController");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");


router.route("/").get(spaceController.getAllSpace).post(spaceController.careteSpace);

router
  .route("/:id")
  .get(spaceController.getSpace)
  .patch(spaceController.updateSpace)
  .delete(spaceController.updateSpace);
module.exports = router;
