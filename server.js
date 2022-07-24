const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './config.env' });
const colors = require('colors');
const DBConnect = require('./utils/dbConnect');
const express=require('express')

// process.on('uncaughtException', (error) => {
//   // using uncaughtException event
//   console.log(' uncaught Exception => shutting down..... ');
//   console.log(error.name, error.message);
//   process.exit(1); //  emidiatly exists all from all the requests
// });

const app = require('./app');

// database connection
DBConnect();

// server
const port = process.env.PORT || 7000;
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('client/build'));
//   app.get('/*', function (req, res) {
//     res.sendFile(path.join(__dirname, './project1-client/build/index.html'));
//   });
// }
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`.yellow.bold);
});

// handle Globaly  the unhandle Rejection Error which is  outside the express
// e.g database connection
// process.on('unhandledRejection', (error) => {
//   // it uses unhandledRejection event
//   // using unhandledRejection event
//   console.log(' Unhandled Rejection => shutting down..... ');
//   console.log(error.name, error.message);
//   server.close(() => {
//     process.exit(1); //  emidiatly exists all from all the requests sending OR pending
//   });
// });
