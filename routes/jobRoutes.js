const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const mongoose = require("mongoose");

// ✅ GET ALL JOBS (With full 6-job fallback array)
router.get("/", async (req, res) => {
    try {
        let jobs = [];
        
        // Immediate check: If Mongoose isn't connected to Atlas, skip the wait entirely
        if (mongoose.connection.readyState !== 1) {
            console.log("⚠️ Database offline status detected. Instantly executing offline mode list.");
        } else {
            try {
                // maxTimeMS(2000) prevents hanging if a partial firewall connection stalls
                jobs = await Job.find().maxTimeMS(2000);
            } catch (dbErr) {
                console.log("⚠️ Database read timed out or failed. Activating local fallback array.");
            }
        }
        
        // If MongoDB is offline, unauthenticated, or empty, load all 6 roles safely
        if (!jobs || jobs.length === 0) {
            jobs = [
                { _id: '6a3f8e2cfc8f37b56de20be4', jobTitle: 'Network Engineer', company: 'Pi Systems', location: 'Chennai', experience: '0-2 Years', skills: ['IP Subnetting', 'OSPF', 'VLAN', 'Cisco Packet Tracer'], description: 'Manage deployment topology frameworks.' },
                { _id: '6a3f8e07fc8f37b56de20be0', jobTitle: 'Python Developer', company: 'Pi Systems', location: 'Chennai', experience: '1-3 Years', skills: ['Python', 'Django', 'REST APIs', 'SQL'], description: 'Build scalable server infrastructures.' },
                { _id: '6a3f8f88fc8f37b56de20be4', jobTitle: 'AI/ML Engineer', company: 'Pi Systems', location: 'Chennai', experience: '2+ Years', skills: ['Python', 'Gemini API', 'Verilog', 'TensorFlow'], description: 'Deploy predictive model learning architectures.' },
                { _id: '6a3f8eldfc8f37b56de20be2', jobTitle: 'Cybersecurity Analyst', company: 'Pi Systems', location: 'Chennai', experience: '1-3 Years', skills: ['Penetration Testing', 'Wireshark', 'SIEM', 'Linux'], description: 'Secure enterprise network boundaries.' },
                { _id: '6a3f8e3bfc8f37b56de20be6', jobTitle: 'Full Stack Developer', company: 'Pi Systems', location: 'Chennai', experience: '0-3 Years', skills: ['React', 'Node.js', 'Express', 'MongoDB'], description: 'Architect customer facing dashboard applications.' },
                { _id: '6a3f8e49fc8f37b56de20be8', jobTitle: 'Data Scientist', company: 'Pi Systems', location: 'Chennai', experience: '1+ Years', skills: ['Python', 'Pandas', 'Data Models', 'R'], description: 'Clean and visualize structural operational data pools.' }
            ];
        }
        
        res.json({ success: true, jobs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ ADD JOB (with duplicate prevention)
router.post("/", async (req, res) => {
    try {
        const { jobTitle, company, location, experience, skills, description } = req.body;
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ success: false, message: "Database is currently offline. Cannot create live roles." });
        }
        const existingJob = await Job.findOne({ jobTitle });
        if (existingJob) {
            return res.status(400).json({ success: false, message: "Job already exists" });
        }
        const job = new Job({ jobTitle, company, location, experience, skills, description });
        await job.save();
        res.json({ success: true, message: "Job created successfully", job });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ DELETE JOB
router.delete("/:id", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ success: false, message: "Database offline." });
        }
        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ UPDATE JOB
router.put("/:id", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ success: false, message: "Database offline." });
        }
        const { jobTitle, company, location, experience, skills, description } = req.body;
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { jobTitle, company, location, experience, skills, description },
            { new: true }
        );
        res.json({ success: true, message: "Job updated successfully", job: updatedJob });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;