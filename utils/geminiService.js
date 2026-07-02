const { GoogleGenAI } = require("@google/genai"); 
const mongoose = require("mongoose");

// Safe extraction of the Job model
const Job = mongoose.models.Job || require("../models/Job"); 

const analyzeResume = async (resumeText, jobId) => {
  try {
    // 1. Initialize with your environment key correctly using the new SDK standard
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 2. Fetch the target job profile from your database
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error("Target job profile not found in database.");
    }

    // 3. Construct a highly strict extraction prompt optimized for Flash models
    const prompt = `
      You are an expert AI Applicant Tracking System (ATS). Your absolute highest priority task is to parse the Candidate Resume Text and accurately isolate the candidate's real formal name. 
      
      CRITICAL INSTRUCTION FOR NAME: Look closely at the top 3-5 lines of the resume text. Do not invent a name, do not use placeholder tokens, and do not use generic text. 

      Target Job Position: ${job.jobTitle}
      Target Company: ${job.company || 'Our Company'}
      Required Skills for Job: ${JSON.stringify(job.skills || [])}
      Job Description: ${job.description || ''}

      Candidate Resume Text:
      """
      ${resumeText}
      """

      Return a valid JSON object matching this structure exactly. Do not include markdown syntax or code block wrappers:
      {
        "candidateName": "Insert Extracted Real Full Name Here",
        "score": 85,
        "matchedSkills": ["Skill A", "Skill B"],
        "missingSkills": ["Skill C"],
        "recommendation": "The candidate shows strong matching elements..."
      }
    `;

    // 4. Using the correct, free-tier accessible Gemini 2.5 Flash model interface
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    // 5. SANITATION WRAPPER: Clean markdown backticks if present safely
    let rawText = response.text ? response.text.trim() : "";
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }

    // 6. Return parsed clean JSON object
    return JSON.parse(rawText);

  } catch (error) {
    console.error("Live Gemini API Error:", error);
    // Fallback safe payload object so your UI never breaks
    return {
      candidateName: "Extraction Error",
      score: 50,
      matchedSkills: [],
      missingSkills: ["Analysis Parse Interrupted"],
      recommendation: "Real-time parsing encountered an API limitation issue. Technical error detail: " + error.message
    };
  }
};

module.exports = { analyzeResume };