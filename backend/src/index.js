import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = new Set([
    "https://careernex-ai.vercel.app",
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter(Boolean));

const roleRoadmaps = {
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Next.js", "Testing", "Accessibility", "Performance optimization"],
    "Backend Developer": ["Node.js", "REST APIs", "Databases", "Authentication", "Caching", "Testing", "Docker", "Cloud deployment", "System design"],
    "Full Stack Developer": ["JavaScript", "React", "Node.js", "Databases", "TypeScript", "API design", "Testing", "Deployment", "System design"],
    "Data Analyst": ["Excel", "SQL", "Python", "Statistics", "Power BI", "Tableau", "Data storytelling", "Business metrics"],
    "Data Scientist": ["Python", "SQL", "Statistics", "Pandas", "Machine Learning", "Model evaluation", "Visualization", "Experimentation"],
    "ML Engineer": ["Python", "Machine Learning", "Deep Learning", "MLOps", "Docker", "Model deployment", "Monitoring", "Cloud"],
    "AI Engineer": ["Python", "LLMs", "Prompt engineering", "RAG", "Vector databases", "LangChain", "Evaluation", "Deployment"],
    "Python Developer": ["Python", "OOP", "FastAPI", "Django", "SQL", "Testing", "Automation", "Deployment"],
    "Java Developer": ["Java", "OOP", "Spring Boot", "SQL", "REST APIs", "Testing", "Microservices", "Cloud"],
};

const roleKeywordMap = Object.fromEntries(
    Object.entries(roleRoadmaps).map(([role, skills]) => [role, skills.map((skill) => skill.toLowerCase())]),
);

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin) || /https:\/\/.*\.prettiflow\.com$/.test(origin) || /https:\/\/.*\.vercel\.app$/.test(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

const jsonError = (res, status, message, details) => {
    res.status(status).json({ error: message, details: details || null });
};

const normalizeRole = (role) => roleRoadmaps[role] ? role : "Full Stack Developer";

const readStreamBuffer = (req) => new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
});

const extractMultipartText = (buffer) => {
    const raw = buffer.toString("utf8");
    return raw
        .replace(/------[^\n\r]+/g, " ")
        .replace(/Content-Disposition:[^\n\r]+/gi, " ")
        .replace(/Content-Type:[^\n\r]+/gi, " ")
        .replace(/%PDF-[\s\S]*?%%EOF/g, " PDF resume content uploaded ")
        .replace(/[\x00-\x08\x0E-\x1F]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const getResumeText = async (req) => {
    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
        return String(req.body.resumeText || req.body.text || req.body.content || "").trim();
    }

    const buffer = await readStreamBuffer(req);
    if (!buffer.length) return "";
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) return extractMultipartText(buffer);
    return buffer.toString("utf8").replace(/\s+/g, " ").trim();
};

const uniqueMatches = (text, keywords) => {
    const lower = text.toLowerCase();
    return [...new Set(keywords.filter((keyword) => lower.includes(keyword.toLowerCase())))];
};

const extractSkills = (text) => {
    const skillBank = [
        "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "REST APIs", "GraphQL", "SQL", "PostgreSQL", "MongoDB", "Python", "Java", "Spring Boot", "Git", "GitHub", "Docker", "AWS", "Azure", "Testing", "Jest", "Cypress", "Accessibility", "Performance", "Machine Learning", "Deep Learning", "Pandas", "NumPy", "Tableau", "Power BI", "LLMs", "RAG", "Vector databases", "Prompt engineering",
    ];
    return uniqueMatches(text, skillBank);
};

const detectResumeSections = (text) => {
    const lower = text.toLowerCase();
    return {
        summary: /summary|objective|profile/.test(lower),
        experience: /experience|employment|work history|internship/.test(lower),
        projects: /projects|project/.test(lower),
        education: /education|degree|university|college/.test(lower),
        certifications: /certification|certificate|certified/.test(lower),
        links: /github|linkedin|portfolio|https?:\/\//.test(lower),
    };
};

const analyzeResume = (text, targetRole) => {
    const role = normalizeRole(targetRole);
    const skills = extractSkills(text);
    const roadmapSkills = roleRoadmaps[role];
    const roleKeywords = roleKeywordMap[role];
    const matchedRoleKeywords = uniqueMatches(text, roleKeywords);
    const missingKeywords = roadmapSkills.filter((skill) => !matchedRoleKeywords.includes(skill.toLowerCase()));
    const sections = detectResumeSections(text);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const hasMetrics = /\b\d+(%|\+|x|k|m| users| clients| projects| seconds| hours| revenue)?\b/i.test(text);
    const actionVerbs = uniqueMatches(text, ["built", "created", "designed", "developed", "implemented", "optimized", "led", "improved", "deployed", "analyzed", "automated"]);
    const weakPhrases = uniqueMatches(text, ["responsible for", "worked on", "helped with", "basic knowledge", "familiar with"]);

    const formattingScore = Math.min(100, 50 + Object.values(sections).filter(Boolean).length * 8 + (wordCount >= 250 && wordCount <= 900 ? 10 : 0));
    const keywordScore = Math.round((matchedRoleKeywords.length / Math.max(roleKeywords.length, 1)) * 100);
    const readabilityScore = Math.max(45, Math.min(96, 88 - Math.max(0, wordCount - 700) / 20 + (sections.summary ? 4 : -6)));
    const technicalScore = Math.min(100, 35 + skills.length * 7 + matchedRoleKeywords.length * 5);
    const recruiterScore = Math.min(100, 45 + (hasMetrics ? 15 : 0) + actionVerbs.length * 4 + (sections.links ? 10 : 0) + (sections.projects ? 10 : 0));
    const atsScore = Math.round((formattingScore * 0.2) + (keywordScore * 0.25) + (readabilityScore * 0.15) + (technicalScore * 0.2) + (recruiterScore * 0.2));

    const mistakes = [
        !hasMetrics && "Add measurable outcomes such as %, users, latency, revenue, or time saved.",
        actionVerbs.length < 4 && "Use stronger action verbs like built, optimized, deployed, automated, and led.",
        !sections.projects && "Add a dedicated projects section with problem, stack, impact, and links.",
        !sections.links && "Add GitHub, LinkedIn, and portfolio links near the header.",
        !sections.summary && "Add a focused 2-3 line professional summary tailored to the target role.",
        weakPhrases.length > 0 && `Replace vague phrases: ${weakPhrases.join(", ")}.`,
        missingKeywords.length > 3 && `Include relevant ${role} keywords: ${missingKeywords.slice(0, 6).join(", ")}.`,
    ].filter(Boolean);

    const strengths = [
        ...skills.slice(0, 8),
        sections.projects ? "Project experience" : null,
        sections.education ? "Education details" : null,
        sections.links ? "Professional links" : null,
    ].filter(Boolean);

    const improvements = [
        "Tailor the first half of the resume to the selected role and job description.",
        "Rewrite bullets using: Action verb + technical method + measurable business or user impact.",
        "Add a skills matrix grouped by languages, frameworks, databases, tools, and cloud.",
        "Place the most relevant projects above less relevant coursework or activities.",
        "Quantify internships, projects, and achievements wherever possible.",
    ];

    const roadmap = missingKeywords.slice(0, 8).map((skill) => `Learn ${skill} and add a project or resume bullet proving it`);

    return {
        atsScore,
        readabilityScore: Math.round(readabilityScore),
        keywordOptimizationScore: keywordScore,
        technicalRelevanceScore: Math.round(technicalScore),
        formattingScore: Math.round(formattingScore),
        recruiterFriendlinessScore: Math.round(recruiterScore),
        skillMatchPercent: keywordScore,
        atsReadiness: atsScore >= 80 ? "High" : atsScore >= 65 ? "Moderate" : "Needs improvement",
        marketDemandScore: Math.min(98, 70 + matchedRoleKeywords.length * 3),
        interviewReadiness: Math.min(100, 45 + skills.length * 4 + (sections.projects ? 15 : 0) + (hasMetrics ? 10 : 0)),
        targetRole: role,
        skills,
        strengths: strengths.length ? strengths : ["Resume uploaded successfully", "Clear starting point for improvement"],
        improvements,
        missingKeywords,
        mistakes,
        roadmap: roadmap.length ? roadmap : ["Build an advanced role-specific project", "Practice behavioral and technical interviews", "Polish portfolio case studies"],
        learningRoadmap: buildRoadmap(role, missingKeywords),
        sections,
        formattingQuality: formattingScore >= 80 ? "Clean ATS-friendly structure" : "Needs clearer headings, links, and consistent bullet formatting",
    };
};

const buildRoadmap = (targetRole, missing = []) => {
    const role = normalizeRole(targetRole);
    const sequence = missing.length ? missing : roleRoadmaps[role];
    return {
        targetRole: role,
        thirtyDay: sequence.slice(0, 3).map((skill) => `Master fundamentals of ${skill} and document notes in GitHub`),
        sixtyDay: sequence.slice(3, 6).map((skill) => `Build a practical ${skill} feature and add it to portfolio`),
        ninetyDay: sequence.slice(6, 9).map((skill) => `Complete interview-grade ${skill} practice and publish a case study`),
        weeklyMilestones: [
            "Week 1: Audit resume, portfolio, GitHub, and target job descriptions.",
            "Week 2: Fill the highest-impact skill gap with focused practice.",
            "Week 3: Build or upgrade one project with measurable outcomes.",
            "Week 4: Prepare interview stories, mock interviews, and tailored applications.",
        ],
        projectRecommendations: [
            `Build a production-ready ${role} portfolio project with authentication, testing, and deployment.`,
            "Write a technical case study explaining architecture, trade-offs, and measurable impact.",
            "Add clean README files, screenshots, live demos, and issue-based development history.",
        ],
        careerProgression: ["Intern-ready fundamentals", "Junior role portfolio", "Production engineering habits", "Specialized high-demand expertise"],
    };
};

const fallbackCoachReply = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes("frontend")) {
        return "For frontend internships, focus on HTML/CSS fundamentals, JavaScript, React, TypeScript, Next.js, accessibility, testing, and performance. Build 2-3 deployed projects with clean README files, quantify impact, and practice DOM, React hooks, API integration, and behavioral stories using STAR.";
    }
    if (lower.includes("resume")) {
        return "Improve your resume by tailoring keywords to the target role, adding measurable bullet points, using strong action verbs, grouping technical skills, adding GitHub/portfolio links, and rewriting each project as problem + tech stack + impact.";
    }
    if (lower.includes("interview")) {
        return "Prepare with a 3-track plan: data structures and coding patterns, role-specific projects/system concepts, and behavioral stories. Schedule mock interviews weekly and maintain a mistake log for rapid improvement.";
    }
    return "CareerNex AI recommends choosing one target role, comparing your resume against 8-10 job descriptions, filling the top 3 skill gaps, building one proof-based project, and tailoring your resume, GitHub, LinkedIn, and applications around measurable outcomes.";
};

const callGemini = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n").trim() || null;
    } catch (error) {
        console.error("Gemini request failed", error);
        return null;
    }
};

// Health check route
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "CareerNex AI backend is running" });
});

// Explicit health endpoint used by production monitors and preview orchestrator
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "CareerNex AI API", routes: ["/api/chat", "/api/resume-analyze", "/api/generate-roadmap", "/api/career-suggestions"] });
});

app.post("/api/chat", async (req, res) => {
    try {
        const message = String(req.body?.message || "").trim();
        if (!message) return jsonError(res, 400, "Message is required");

        const prompt = `You are CareerNex AI, a senior career coach for software, AI, and data roles. Give practical, concise, professional guidance with steps, skills, projects, interview preparation, and roadmap advice. User question: ${message}`;
        const aiReply = await callGemini(prompt);
        res.json({ reply: aiReply || fallbackCoachReply(message), source: aiReply ? "gemini" : "fallback" });
    } catch (error) {
        console.error("Chat endpoint failed", error);
        res.json({ reply: fallbackCoachReply(req.body?.message || "career advice"), source: "fallback", warning: "AI provider unavailable; returned fallback guidance." });
    }
});

app.post("/api/resume-analyze", async (req, res) => {
    try {
        const targetRole = normalizeRole(req.body?.targetRole || req.query?.targetRole || "Full Stack Developer");
        const resumeText = await getResumeText(req);
        if (!resumeText || resumeText.length < 20) {
            return jsonError(res, 400, "Resume content is required. Upload a PDF, DOC, DOCX, TXT, or send resumeText in JSON.");
        }

        const analysis = analyzeResume(resumeText, targetRole);
        res.json(analysis);
    } catch (error) {
        console.error("Resume analysis failed", error);
        jsonError(res, 500, "Resume analysis failed", "Please retry with a PDF, DOC, DOCX, TXT, or plain resume text.");
    }
});

app.post("/api/generate-roadmap", async (req, res) => {
    try {
        const targetRole = normalizeRole(req.body?.targetRole || req.body?.role || "Full Stack Developer");
        const currentSkills = Array.isArray(req.body?.skills) ? req.body.skills.map((skill) => String(skill).toLowerCase()) : [];
        const missingSkills = roleRoadmaps[targetRole].filter((skill) => !currentSkills.includes(skill.toLowerCase()));
        res.json(buildRoadmap(targetRole, missingSkills));
    } catch (error) {
        console.error("Roadmap generation failed", error);
        jsonError(res, 500, "Roadmap generation failed");
    }
});

app.post("/api/career-suggestions", async (req, res) => {
    try {
        const targetRole = normalizeRole(req.body?.targetRole || req.body?.role || "Full Stack Developer");
        const suggestions = {
            targetRole,
            internshipPreparation: ["Apply with tailored resumes in focused weekly batches", "Practice role-specific coding and behavioral interviews", "Ask for referrals with a concise project-based pitch"],
            portfolio: ["Feature 3 best projects with live demos and technical writeups", "Show architecture decisions, screenshots, metrics, and lessons learned", "Make contact links and resume download obvious"],
            github: ["Pin role-relevant repositories", "Add clean READMEs, issue history, tests, and deployment links", "Use consistent commits that show engineering process"],
            linkedin: ["Use a role-specific headline", "Add featured projects and quantified achievements", "Post concise build logs or case studies weekly"],
            resumeTailoring: ["Mirror job description keywords naturally", "Prioritize impact bullets over task descriptions", "Keep formatting ATS-friendly with standard headings"],
            projectGuidance: buildRoadmap(targetRole).projectRecommendations,
        };
        res.json(suggestions);
    } catch (error) {
        console.error("Career suggestions failed", error);
        jsonError(res, 500, "Career suggestions failed");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
