const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// helper to send email (no-op if SMTP not configured)
const sendEmail = async ({ to, subject, text }) => {
  if (!process.env.SMTP_HOST) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@example.com', to, subject, text });
};

exports.register = async (req, res) => {
  const { name, email, password, location } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash, location });
  res.json({ message: "Registered" });
};

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
};

// request password reset (generate token and email link)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ msg: 'If that email exists you will receive a reset link' });

  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${frontend}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await sendEmail({ to: email, subject: 'Password reset', text: `Reset your password: ${link}` });
  } catch (e) {
    console.error('Failed to send reset email', e);
  }

  res.json({ msg: 'If that email exists you will receive a reset link' });
};

// perform password reset
exports.resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });

  const hash = await bcrypt.hash(password, 10);
  user.password = hash;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ msg: 'Password reset successful' });
};
