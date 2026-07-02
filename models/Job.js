const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobTitle: String,
  company: String,
  location: String,
  experience: String,
  skills: [String],
  description: String
}, {
  timestamps: true
});

// 🔥 IMPORTANT FIX
module.exports =
  mongoose.models.Job || mongoose.model("Job", jobSchema);