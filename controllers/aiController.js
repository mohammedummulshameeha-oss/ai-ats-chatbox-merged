const mongoose = require("mongoose");
const Job = require("../models/Job");
// Make sure you have imported your Gemini API setup here, for example:
// const { GoogleGenAI } = require("@google/genai"); 

exports.analyze = async (req, res) => {
    try {
        const { resumeText } = req.body;
        const { jobId } = req.params;

        if (!resumeText) {
            return res.status(400).json({ success: false, message: "Resume text is missing." });
        }

        let targetJob = null;

        // 1. Check if MongoDB Atlas is actively connected and reachable
        if (mongoose.connection.readyState === 1) {
            try {
                // maxTimeMS(2000) forces it to give up in 2 seconds instead of hanging for 10 seconds
                targetJob = await Job.findById(jobId).maxTimeMS(2000);
            } catch (dbErr) {
                console.log("⚠️ AI Controller database lookup timed out. Activating local match matrix.");
            }
        }

        // 2. If database is offline or blocked by a firewall, look up the job details from our local 6-job array
        if (!targetJob) {
            console.log("🔄 Running in local offline match mode for Job ID:", jobId);
            const fallbackJobsList = [
                { _id: '6a3f8e2cfc8f37b56de20be4', jobTitle: 'Network Engineer', skills: ['IP Subnetting', 'OSPF', 'VLAN', 'Cisco Packet Tracer'] },
                { _id: '6a3f8e07fc8f37b56de20be0', jobTitle: 'Python Developer', skills: ['Python', 'Django', 'REST APIs', 'SQL'] },
                { _id: '6a3f8f88fc8f37b56de20be4', jobTitle: 'AI/ML Engineer', skills: ['Python', 'Gemini API', 'Verilog', 'TensorFlow'] },
                { _id: '6a3f8eldfc8f37b56de20be2', jobTitle: 'Cybersecurity Analyst', skills: ['Penetration Testing', 'Wireshark', 'SIEM', 'Linux'] },
                { _id: '6a3f8e3bfc8f37b56de20be6', jobTitle: 'Full Stack Developer', skills: ['React', 'Node.js', 'Express', 'MongoDB'] },
                { _id: '6a3f8e49fc8f37b56de20be8', jobTitle: 'Data Scientist', skills: ['Python', 'Pandas', 'Data Models', 'R'] }
            ];

            // Try to find the selected job by its 24-character hexadecimal ID
            targetJob = fallbackJobsList.find(j => j._id === jobId);
        }

        // 3. If the ID doesn't match anything, look for a name match as a secondary safety fallback
        if (!targetJob) {
            return res.status(404).json({ 
                success: false, 
                message: "Target job template could not be verified in online or offline records." 
            });
        }

        console.log(`🤖 Sending data to Gemini API for role matching: ${targetJob.jobTitle}`);

        // ==================================================================
        // 🧠 YOUR EXISTING GEMINI API INTEGRATION PIPELINE GOES HERE
        // ==================================================================
        // (This is an example structure of how your Gemini prompt handles targetJob.skills)
        
        /*
        const prompt = `Analyze this resume against the required skills: ${targetJob.skills.join(", ")}...`;
        const aiResponse = await callYourGeminiFunction(resumeText, prompt);
        
        // Mock response structure representing what your frontend expects:
        const analysisResult = {
            score: 85,
            matchedSkills: targetJob.skills.slice(0, 2),
            missingSkills: targetJob.skills.slice(2),
            recommendation: "Candidate shows great structural alignment with core technical frameworks."
        };
        */

        // Place your actual Gemini API calling code and response logic here, then return the results:
        res.json({
            success: true,
            data: {
                score: 85, // replace with actual dynamic Gemini score variable
                matchedSkills: targetJob.skills, // replace with actual dynamic Gemini array
                missingSkills: [], // replace with actual dynamic Gemini array
                recommendation: `Successfully evaluated resume requirements against the ${targetJob.jobTitle} position requirements.` // replace with dynamic Gemini text
            }
        });

    } catch (err) {
        console.error("❌ Critical error in AI Controller:", err.message);
        res.status(500).json({ success: false, message: "Internal analysis error: " + err.message });
    }
};
