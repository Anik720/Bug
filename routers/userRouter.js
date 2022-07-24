const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

// router.use(protect); //  protect all router which are comming after this middleware

router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.getMe, userController.updateUser);

router.patch('/updatePassword', authController.updatePassword);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(restrictTo('project_manager'), userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(restrictTo('project_manager'), userController.deleteUser);

module.exports = router;
