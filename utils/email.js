// const nodeMailer = require('nodemailer');
// const ejs = require('ejs');
// const htmlToText = require('html-to-text');

// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// console.log(process.env.SENDGRID_API_KEY)

// const sendMail = async (options) => {
//   // 1 Create Transportor
//   const transportor = nodeMailer.createTransport({
//     service: 'SendGrid',
//     auth: {
//       user: process.env.Sendgrid_Username,
//       pass: process.env.Sendgrid_Password,
//     },
//   });

//   // 2 Render HTML Based on ejs template
//   const html = await ejs.renderFile(
//     `${__dirname}/../views/email/${options.template}`,
//     {
//       user: options.user,
//       url: options.url,
//     }
//   );

//   // console.log(html);

//   // 3 Define Mail Options
//   const mailOptions = {
//     from: process.env.Email_From,
//     to: options.email,
//     subject: options.subject,
//     // text: htmlToText.fromString(html),
//     html,
//   };

//   // 4 Send Email
//   await transportor.sendMail(mailOptions);
// };

// const sendMail = async (options) => {
//    // using Twilio SendGrid's v3 Node.js Library
//    // https://github.com/sendgrid/sendgrid-nodejs

//    const html = await ejs.renderFile(
//       `${__dirname}/../views/email/${options.template}`,
//       {
//          user: options.user,
//          url: options.url,
//       }
//    );

//    const msg = {
//       from: process.env.Email_From,
//       to: options.email,
//       subject: options.subject,
//       // text: htmlToText.fromString(html),
//       html,
//    };

//    sgMail
//       .send(msg)
//       .then(() => {
//          console.log('Email sent');
//       })
//       .catch((error) => {
//          console.error(error);
//       });

//    // try {
//    //   await sgMail.send(msg);
//    // } catch (error) {
//    //   console.error(error);
//    // }
// };
// module.exports = sendMail;


const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
   // this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Fahim Murshed <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'development') {
      console.log(process.env.SENDGRID_USERNAME)
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

   //  return nodemailer.createTransport({
   //    host: process.env.EMAIL_HOST,
   //    port: process.env.EMAIL_PORT,
   //    auth: {
   //      user: process.env.EMAIL_USERNAME,
   //      pass: process.env.EMAIL_PASSWORD
   //    }
   //  });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};

