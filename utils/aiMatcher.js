const calculateATSScore = (jobSkills, resumeText) => {

    const matchedSkills = [];
    const missingSkills = [];

    jobSkills.forEach(skill => {

        if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }

    });

    const score = Math.round(
        (matchedSkills.length / jobSkills.length) * 100
    );

    return {
        score,
        matchedSkills,
        missingSkills
    };
};

module.exports = calculateATSScore;