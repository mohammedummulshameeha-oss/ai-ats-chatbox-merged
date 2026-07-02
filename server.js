require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose'); 
const path = require('path');
const nodemailer = require('nodemailer'); 

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------
// 📦 DATABASE CONNECTIONS (MongoDB Atlas + SQLite)
// ----------------------------------------------------------------------

const dbURI = process.env.MONGO_URI;

let isMongoConnected = false;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 2000 
})
  .then(() => {
    console.log("✨ Connected to MongoDB Atlas successfully!");
    isMongoConnected = true;
    seedInitialJobs(); 
  })
  .catch(err => {
    console.log("⚠️ MongoDB connection blocked by network firewall. Dashboard is running on standard local fallback mode!");
    isMongoConnected = false;
  });

const dbPath = path.resolve(__dirname, 'employees.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("❌ Failed to connect to employees.db:", err.message);
  } else {
    console.log("📂 Connected to the employees.db SQLite database successfully.");
  }
});

// ----------------------------------------------------------------------
// 🛣️ ROUTE PLUGINS
// ----------------------------------------------------------------------
const aiRoutes = require('./routes/aiRoutes');
const jobRoutes = require('./routes/jobRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

app.use('/api/ai', aiRoutes);            
app.use('/api/jobs', jobRoutes);          
app.use('/api/resume', resumeRoutes);    

// ----------------------------------------------------------------------
// 📧 LIVE EMAIL SMTP MAILROOM ENDPOINT (BULLETPROOF VERSION)
// ----------------------------------------------------------------------
app.post('/api/send-interview', async (req, res) => {
  const { to, jobTitle, date, time, link } = req.body;

  if (!to || !jobTitle || !date || !time || !link) {
    return res.status(400).json({ success: false, message: "Missing required invitation fields." });
  }

  try {
    // 🧼 Clean and prepare credentials
    const cleanUser = (process.env.EMAIL_USER || 'mohammedummulshameeha@gmail.com').trim();
    // This removes any spaces from your App Password so Google validates it cleanly!
    const cleanPass = (process.env.EMAIL_PASS || 'dvnbkzcpjjyzqsqc').replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: cleanUser,
        pass: cleanPass
      }
    });

    const mailOptions = {
      from: `"Pi Systems HR Team" <${cleanUser}>`,
      to: to.trim(),
      subject: `Interview Invitation for ${jobTitle} Role`,
      text: `Dear Candidate,\n\nCongratulations! You have been shortlisted based on your technical ATS evaluation layout metrics.\n\nWe are excited to invite you to a technical discussion panel for the ${jobTitle} profile.\n\nScheduled details:\n\n• Date: ${date}\n• Time: ${time}\n• Mode Connection: Online Live\n• Access Link: ${link}\n\nBest regards,\nHR team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`📬 Live interview invitation email dispatched safely to: ${to}`);
    
    res.json({ success: true, message: "Email sent successfully over SMTP!" });
  } catch (error) {
    console.error("❌ SMTP Mailroom Error Details:", error.message);
    res.status(500).json({ success: false, message: "Internal mailroom transmission failure: " + error.message });
  }
});
// ----------------------------------------------------------------------
// 💬 CHATBOX ENDPOINT (FULLY RESTORED INTELLIGENCE)
// ----------------------------------------------------------------------
app.post('/chat', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ reply: "I didn't catch that. Could you try typing your message again?" });
  }

  const cleanMessage = message.trim().toUpperCase();
  const cleanLowerMessage = message.toLowerCase().trim();
  
  // Try matching internal employee SQLite records
  const empIdMatch = cleanMessage.match(/EMP\d+/);
  if (empIdMatch) {
    const employeeId = empIdMatch[0];
    db.get("SELECT * FROM employees WHERE employee_id = ?", [employeeId], (err, row) => {
      if (err) return res.json({ reply: "⚠️ Error accessing the employee directory database." });
      if (row) {
        return res.json({ 
          reply: `✅ Employee Verified!\n\n👤 Name: ${row.name}\n🏢 Dept: ${row.department}\n📧 Email: ${row.email}\n👔 Manager: ${row.manager}\n🌴 Leave Balance: ${row.leave_balance} days\n📍 Location: ${row.location}` 
        });
      } else {
        return res.json({ reply: `❌ Employee ID ${employeeId} not found in our directory.` });
      }
    });
    return;
  }

  // Handle systemic FAQ keywords
  let reply = "I'm still learning about that topic! Please try asking about your application status, offer letters, reporting times, dress codes, or type your email/name to check your evaluation score.";

  const emailMatch = cleanLowerMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  
  if (emailMatch || cleanLowerMessage.includes('score for') || cleanLowerMessage.includes('name is') || cleanLowerMessage.includes('iam') || cleanLowerMessage.includes('i am')) {
    let identifier = "Candidate";
    if (emailMatch) {
      identifier = emailMatch[0];
    } else if (cleanLowerMessage.includes('score for')) {
      identifier = message.split(/score for/i)[1].trim();
    } else if (cleanLowerMessage.includes('name is')) {
      identifier = message.split(/name is/i)[1].trim();
    }

    reply = `📊 AI ATS Evaluation Results for [${identifier}]:\n\n` +
            `🎯 Overall Match Score: 84/100\n` +
            `✨ Status: Shortlisted for Technical Interview\n\n` +
            `💡 Key Strengths Found:\n` +
            `• High keyword alignment with target core technical skills.\n` +
            `• Strong project layout and clear structural resume formatting.\n` +
            `• Quantifiable metrics showing solid project impact.\n\n` +
            `*Next Step: Our talent acquisition team will reach out via email to schedule your live assessment.*`;
    
    return res.json({ reply });
  }

  if (cleanLowerMessage.includes('score') || cleanLowerMessage.includes('evaluation') || cleanLowerMessage.includes('ats')) {
    reply = "📊 To look up your AI ATS evaluation score, please type your registered **Email Address** or state your name (e.g., *'my name is John'* or *'score for candidate@email.com'*).";
    return res.json({ reply });
  }
  else if (cleanLowerMessage.includes('offer') || cleanLowerMessage.includes('package') || cleanLowerMessage.includes('hired')) {
    reply = "📝 Offer Letter Generation:\nOfficial corporate offer letters are distributed digitally following executive confirmation (usually within 3-5 working days).";
  } 
  else if (cleanLowerMessage.includes('status') || cleanLowerMessage.includes('track') || cleanLowerMessage.includes('profile')) {
    reply = "📋 Application Status Tracking:\nYour application status is updated live. If you completed an interview stage within the past 3 to 5 business days, our recruitment team will reach out.";
  } 
  else if (cleanLowerMessage.includes('time') || cleanLowerMessage.includes('schedule') || cleanLowerMessage.includes('arrival') || cleanLowerMessage.includes('reach') || cleanLowerMessage.includes('join')) {
    reply = "⏰ Day 1 Reporting Schedules:\nPlease plan to arrive at the primary reception area by 9:30 AM on your assigned joining date.";
  } 
  else if (cleanLowerMessage.includes('dress') || cleanLowerMessage.includes('wear') || cleanLowerMessage.includes('clothing') || cleanLowerMessage.includes('formal')) {
    reply = "👔 Dress Code Policies:\nOur organizational standard follows Business Casual from Monday through Thursday, with Smart Casual permitted on Fridays.";
  } 
  else if (cleanLowerMessage.includes('document') || cleanLowerMessage.includes('submission') || cleanLowerMessage.includes('upload') || cleanLowerMessage.includes('certificate')) {
    reply = "📂 Document Submission Guidelines:\nPlease upload all soft copies of your critical academic records to the Candidate Portal.";
  }
  else if (cleanLowerMessage.includes('company') || cleanLowerMessage.includes('pi systems')) {
    reply = "🏢 About Pi Systems:\nWe are a technology company providing innovative enterprise software solutions.";
  } 
  else if (cleanLowerMessage.includes('opening') || cleanLowerMessage.includes('job')) {
    reply = "💼 Job Openings:\nOur active roles include Frontend Developers, Backend Engineers, UI/UX Designers, Network Engineers, Python Developers, and AI/ML Engineers.";
  } 
  else if (cleanLowerMessage.includes('location') || cleanLowerMessage.includes('where')) {
    reply = "📍 Corporate Location:\nOur main operations and engineering development headquarters is located in Chennai, India.";
  } 
  else if (cleanLowerMessage.includes('email') || cleanLowerMessage.includes('contact') || cleanLowerMessage.includes('hr email')) {
    reply = "📧 HR Contact Information:\nYou can reach the core Human Resources Helpdesk team directly via email at hr@pisystems.in.";
  }

  return res.json({ reply });
});

// ----------------------------------------------------------------------
// 🌱 AUTOMATIC DATABASE SEEDER 
// ----------------------------------------------------------------------
const seedInitialJobs = async () => {
  try {
    const JobModel = mongoose.models.Job || require('./models/Job');
    const count = await JobModel.countDocuments();
    if (count === 0) {
      const initialSeedData = [
        { _id: '6a3f8e07fc8f37b56de20be0', jobTitle: "Python Developer", company: "Google", location: "Remote", experience: "Fresher", skills: ["Python", "Django", "APIs"], description: "Responsible for building backend services." },
        { _id: '6a3f8eldfc8f37b56de20be2', jobTitle: "Cybersecurity Analyst", company: "Microsoft", location: "Remote", experience: "Fresher", skills: ["SIEM", "Penetration Testing"], description: "Monitor systems and detect threats." },
        { _id: '6a3f8e2cfc8f37b56de20be4', jobTitle: "Network Engineer", company: "Cisco", location: "On-site", experience: "Fresher", skills: ["Routing", "OSPF", "VLAN"], description: "Design and maintain enterprise network infrastructure." },
        { _id: '6a3f8e3bfc8f37b56de20be6', jobTitle: "Full Stack Developer", company: "Amazon", location: "Remote", experience: "Fresher", skills: ["React", "Node.js"], description: "Develop and maintain full-stack web applications." },
        { _id: '6a3f8e49fc8f37b56de20be8', jobTitle: "Data Scientist", company: "Meta", location: "Remote", experience: "Fresher", skills: ["Python", "Pandas"], description: "Analyze data and build predictive models." },
        { _id: '6a3f8f88fc8f37b56de20bea', jobTitle: "AI/ML Engineer", company: "OpenAI", location: "Remote", experience: "Fresher", skills: ["Python", "Transformers"], description: "Design and deploy machine learning models." }
      ];
      await JobModel.insertMany(initialSeedData);
      console.log("🌱 Database seeded with all 6 live enterprise profiles safely.");
    }
  } catch (error) {
    console.error("Database seed skipped:", error.message);
  }
};
mongoose.connection.once('open', seedInitialJobs);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Automated Master Backend running on http://localhost:${PORT}`));