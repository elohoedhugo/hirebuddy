require("dotenv").config();

const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const prisma = new PrismaClient();
const app = express();

const upload = multer({
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json());
app.use(cors());

async function extractTextFromFile(file) {
  try {
    if (!file) throw new Error("No file uploaded");

    if (file.mimetype === "application/pdf") {
      const pdfDoc = await pdfParse(file.buffer);
      return pdfDoc.text.trim();
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value.trim();
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (error) {
    console.error("Text extraction failed:", error);
    throw new Error(`Text extaction failed: ${error.message}`);
  }
}

function extractSkills(text) {
  const commonSkills = [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "HTML",
    "CSS",
    "SQL",
    "Git",
    "Redux",
    "TypeScript",
    "Project Management",
    "Communication",
    "Sales",
    "Marketing",
    "Customer Service",
    "Data Analysis",
    "Leadership",
    "Accounting",
    "Graphic Design",
    "Writing",
    "Public Speaking",
    "Teamwork",
  ];

  return commonSkills.filter((skill) =>
    new RegExp(`\\b${skill}\\b`, "i").test(text)
  );
}

function predictRoles(text) {
  const lowerText = text.toLowerCase();
  const roles = [];

  if (
    lowerText.includes("frontend") ||
    lowerText.includes("react") ||
    lowerText.includes("angular")
  ) {
    roles.push("Frontend");
  }
  if (
    lowerText.includes("backend") ||
    lowerText.includes("node") ||
    lowerText.includes("api")
  ) {
    roles.push("Backend");
  }
  if (lowerText.includes("full stack") || lowerText.includes("fullstack")) {
    roles.push("FullStack");
  }

  if (
    lowerText.includes("project manager") ||
    lowerText.includes("project management")
  ) {
    roles.push("Manager");
  }
  if (lowerText.includes("sales") || lowerText.includes("salesforce")) {
    roles.push("Sales");
  }
  if (lowerText.includes("marketing") || lowerText.includes("seo")) {
    roles.push("Marketing");
  }
  if (
    lowerText.includes("customer service") ||
    lowerText.includes("client relations")
  ) {
    roles.push("Representative");
  }
  if (
    lowerText.includes("data analysis") ||
    lowerText.includes("data analyst")
  ) {
    roles.push("Analyst");
  }
  if (lowerText.includes("accounting") || lowerText.includes("accountant")) {
    roles.push("Accountant");
  }
  if (lowerText.includes("graphic design") || lowerText.includes("photoshop")) {
    roles.push("Designer");
  }
  if (lowerText.includes("writing") || lowerText.includes("content writer")) {
    roles.push("Writer");
  }
  if (
    lowerText.includes("public speaking") ||
    lowerText.includes("presentation skills")
  ) {
    roles.push("Speaker");
  }
  if (lowerText.includes("teamwork") || lowerText.includes("collaboration")) {
    roles.push("Team");
  }

  return roles.length > 0 ? roles : ["General"];
}

app.get("/api/jobs", async (req, res) => {
  try {
    const { search } = req.query;

    const keywords = search ? search.split(/\s+/) : [];

    const jobs = await prisma.job.findMany({
      where: {
        OR: keywords.map((keyword) => ({
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        })),
      },
      take: 100,
    });

    console.log(
      "Found jobs:",
      jobs.map((job) => job.title)
    );

    if (search) {
      await prisma.searchQuery.upsert({
        where: { query: search },
        create: { query: search, count: 1 },
        update: { count: { increment: 1 } },
      });
    }

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch jobs" });
  }
});

app.post("/api/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }
    const text = await extractTextFromFile(req.file);
    const skills = extractSkills(text);
    const roles = predictRoles(text);

    res.json({
      success: true,
      data: { skills, roles },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error:
        err.message === "File too large"
          ? "File size exceeds 5MB limit"
          : "File upload error",
    });
  }
  next(err);
});

const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints`);
    console.log(`- GET http://localhost:${PORT}/api/jobs?search=term`);
    console.log(`-POST http://localhost:${PORT}/api/parse-resume`);
  });
}
module.exports = app;
