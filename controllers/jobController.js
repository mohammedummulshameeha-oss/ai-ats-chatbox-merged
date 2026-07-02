const createJob = (req, res) => {
  try {
    const jobData = req.body;

    console.log("Received Job Data:", jobData);

    res.status(201).json({
      success: true,
      message: "Job Created Successfully!",
      job: jobData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating job",
    });
  }
};

const getAllJobs = (req, res) => {
  res.status(200).json({
    success: true,
    jobs: [],
  });
};

module.exports = {
  createJob,
  getAllJobs,
};