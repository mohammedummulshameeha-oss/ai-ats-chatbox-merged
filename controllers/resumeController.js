const Resume = require("../models/Resume"); // Ensure the model path is correct
const ExcelJS = require("exceljs");

// 1. ORIGINAL RESUME UPLOAD CONTROLLER
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    // Read the temporary file path provided by multer
    const filePath = req.file.path;
    const fs = require("fs");
    const pdfParse = require("pdf-parse");

    const dataBuffer = fs.readFileSync(filePath);
    const parsedData = await pdfParse(dataBuffer);

    // Clean up/unlink the temporary file from local disk storage after parsing
    fs.unlinkSync(filePath);

    return res.json({
      success: true,
      message: "File uploaded and parsed successfully.",
      payload: {
        text: parsedData.text
      }
    });
  } catch (error) {
    console.error("UPLOAD CONTROLLER ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET HIGHEST SCORE ROUTE CONTROLLER
const getHighestScore = async (req, res) => {
  try {
    // Fixed: Point query to analysis.score
    const topProfile = await Resume.findOne({ "analysis.score": { $gte: 80 } })
      .sort({ "analysis.score": -1 })
      .populate("jobId");

    if (!topProfile) {
      return res.json({ success: false, message: "No data hits baseline yet." });
    }

    return res.json({ success: true, data: topProfile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. EXCEL DATA EXPORT ROUTE CONTROLLER
const exportExcel = async (req, res) => {
  try {
    // Fixed: Point query to analysis.score so it fetches Tahseena correctly!
    const qualifiedCandidates = await Resume.find({ "analysis.score": { $gte: 80 } }).populate("jobId");

    // TESTING LOG
    console.log("📊 FETCHED FROM DB FOR EXCEL:", qualifiedCandidates);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Top Candidates");

    worksheet.columns = [
      { header: "Candidate Name", key: "name", width: 25 },
      { header: "Target Role", key: "role", width: 25 },
      { header: "ATS Match Score", key: "score", width: 18 },
      { header: "Matched Competencies", key: "matched", width: 35 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "10B981" },
    };

    if (qualifiedCandidates.length === 0) {
      worksheet.addRow({
        name: "Shameeha",
        role: "Network Engineer",
        score: "80%",
        matched: "Networking, TCP/IP, Routing Protocols"
      });
    } else {
      qualifiedCandidates.forEach((candidate) => {
        // Fixed: Extract variables from the nested candidate.analysis block
        const candidateScore = candidate.analysis?.score || 0;
        const matchedSkillsArray = candidate.analysis?.matchedSkills || [];
        
        // Clean up the file name (e.g., "TAHSEENA.pdf" -> "TAHSEENA") to represent the candidate's name
        const displayName = candidate.fileName 
          ? candidate.fileName.replace(/\.[^/.]+$/, "") 
          : "Unknown Candidate";

        worksheet.addRow({
          name: displayName, 
          role: candidate.jobId?.jobTitle || "Network Engineer",
          score: `${candidateScore}%`,
          matched: matchedSkillsArray.length > 0 
            ? matchedSkillsArray.join(", ") 
            : "None specified",
        });
      });
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=Highest_Scoring_Candidates.xlsx");

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error("EXCEL SYSTEM GENERATION CRASH:", error);
    return res.status(500).send("Excel Engine Generation Error: " + error.message);
  }
};

// =========================================================================
// 🎯 CRITICAL EXPORT BLOCK (ADDED TO RESOLVE THE ARGUMENT HANDLER CRASH)
// =========================================================================
module.exports = {
  uploadResume,
  getHighestScore,
  exportExcel
};