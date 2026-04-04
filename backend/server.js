require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const passport = require('./passport');
const cron = require('node-cron');
const resetMonthlyPoints = require('./jobs/monthlyReset');

const app = express();
app.use(cors());

connectDB();

app.use(express.json());
app.use(passport.initialize());

// ensure uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// schedule monthly reset at 00:05 on the first day of each month
cron.schedule('5 0 1 * *', () => {
  resetMonthlyPoints();
});

app.listen(5000, () => console.log("Server running"));
