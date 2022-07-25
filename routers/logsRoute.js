const express = require("express");

const router = express.Router();

const logController = require("../controllers/logController");

const authController = require("../controllers/authController");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");

router.route("/").get(logController.getAllLogs).post(logController.createLog);

router
  .route("/:id")
  .get(logController.getLog)
  .patch(logController.updateLog)
  .delete(logController.deleteLog);

module.exports = router;
