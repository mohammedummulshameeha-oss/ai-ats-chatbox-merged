const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
{
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },

    fileName: {
        type: String,
        required: true
    },

    filePath: {
        type: String,
        required: true
    },

    extractedText: {
        type: String,
        required: true
    },

    analysis: {
        score: {
            type: Number,
            default: 0
        },
        matchedSkills: {
            type: [String],
            default: []
        },
        missingSkills: {
            type: [String],
            default: []
        },
        recommendation: {
            type: String,
            default: ""
        }
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Resume", resumeSchema);