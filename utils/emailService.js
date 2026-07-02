const nodemailer = require("nodemailer");

const sendInterviewEmail = async (toEmail, name, jobTitle, score) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `Interview Invitation - ${jobTitle}`,
      html: `
        <h2>Congratulations ${name} 🎉</h2>
        <p>You have been shortlisted for <b>${jobTitle}</b>.</p>
        <p>Your AI ATS Score: <b>${score}</b></p>
        <p>We would like to invite you for an interview.</p>
        <br/>
        <p>HR Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email error:", error.message);
  }
};

module.exports = sendInterviewEmail;