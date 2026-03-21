const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('\nERROR: MONGO_URI environment variable is not set.\nPlease set MONGO_URI in your backend/.env or environment and restart the server.\nExample: MONGO_URI=mongodb://localhost:27017/e2e\n');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
