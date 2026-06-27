const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email notification to a task owner.
 * Falls back gracefully if email is not configured.
 */
async function sendTaskEmail({ to, subject, text }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("[Email] Not configured — skipping email to:", to);
    return;
  }

  if (!to) {
    console.log("[Email] No recipient email address — skipping");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`[Email] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error("[Email] Failed to send:", err.message);
  }
}

async function sendOverdueEmail(user, task) {
  await sendTaskEmail({
    to: user.email,
    subject: `Task Overdue: ${task.title}`,
    text: `Hi ${user.username},\n\nYour task "${task.title}" is now overdue.\n\nDescription: ${task.description}\nDue date: ${task.due_date.toDateString()}\n\nPlease log in to update it.\n\nTodo App`,
  });
}

async function sendCompletedEmail(user, task) {
  await sendTaskEmail({
    to: user.email,
    subject: `Task Completed: ${task.title}`,
    text: `Hi ${user.username},\n\nYour task "${task.title}" has been marked as completed. Great work!\n\nTodo App`,
  });
}

module.exports = { sendOverdueEmail, sendCompletedEmail };
