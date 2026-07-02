const express = require("express");
const router = express.Router();
const { analyze } = require("../controllers/aiController");

// This creates: POST http://localhost:5000/api/ai/analyze/:jobId
router.post("/analyze/:jobId", analyze);

module.exports = router;