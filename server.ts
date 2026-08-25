import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize Gemini client lazily
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      geminiAvailable: !!process.env.GEMINI_API_KEY,
    });
  });

  // Seed dataset endpoint
  app.get("/api/seed-data", (req, res) => {
    try {
      const filePath = path.join(process.cwd(), "seed_dataset_india_premium.json");
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf-8");
        return res.json(JSON.parse(data));
      }
      res.status(404).json({ error: "Seed data file not found" });
    } catch (e) {
      res.status(500).json({ error: "Failed to read seed dataset", details: String(e) });
    }
  });

  // Serve static seed file directly if requested
  app.get("/seed_dataset_india_premium.json", (req, res) => {
    const filePath = path.join(process.cwd(), "seed_dataset_india_premium.json");
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/json");
      return res.sendFile(filePath);
    }
    res.status(404).send("Not found");
  });

  // Serve shared client core library
  app.get("/aleropath-core.js", (req, res) => {
    const filePath = path.join(process.cwd(), "aleropath-core.js");
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/javascript");
      return res.sendFile(filePath);
    }
    res.status(404).send("Not found");
  });

  // AI Auto-tagging endpoint using Gemini
  app.post("/api/gemini/tag-opportunity", async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Opportunity text is required" });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({
        fallback: true,
        message: "Gemini API key not configured, fallback will be used on client",
      });
    }

    try {
      const prompt = `You are the Aleropath Opportunity Intelligence Engine. Extract structured data from this messy student/builder opportunity text:
"""
${text}
"""

Return a clean, accurate structured opportunity adhering strictly to the JSON schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "Extract structured opportunity signals from raw text for an opportunity matching graph. Be precise. Categorize as Event, Project, Mentor, Workshop, Competition, or Community. Identify all explicit or implied tech skills and domain interests.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A concise, engaging title for the opportunity" },
              category: {
                type: Type.STRING,
                description: "Event, Project, Mentor, Workshop, Competition, or Community",
              },
              type: {
                type: Type.STRING,
                description: "event, project, or mentor",
              },
              description: { type: Type.STRING, description: "Cleaned summary description" },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Extracted required technical or soft skills (e.g. React, Figma, Python)",
              },
              interests: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Domain tags (e.g. AI, EdTech, FinTech, Web3)",
              },
              location: { type: Type.STRING, description: "City in India (e.g. Bengaluru, Mumbai, Delhi NCR) or Remote" },
              mode: { type: Type.STRING, description: "In Person, Online, or Hybrid" },
              date: { type: Type.STRING, description: "Detected date/time or Upcoming" },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key searchable tags (max 6)",
              },
              intent_fit: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Who this is suited for: Teammate, Project, Event, Mentor",
              },
              budget_inr: { type: Type.NUMBER, description: "Stipend, prize or price in INR if mentioned, else 0" },
              spots: { type: Type.NUMBER, description: "Number of openings/attendees if mentioned, else default" },
            },
            required: [
              "title",
              "category",
              "type",
              "description",
              "skills",
              "interests",
              "location",
              "mode",
              "tags",
            ],
          },
        },
      });

      const structured = JSON.parse(response.text || "{}");
      return res.json({ success: true, structured });
    } catch (error) {
      console.error("[Gemini Auto-tagging error]:", error);
      return res.status(500).json({
        fallback: true,
        error: "AI auto-tagging failed",
        details: String(error),
      });
    }
  });

  // AI Match Explanation endpoint using Gemini
  app.post("/api/gemini/explain-match", async (req, res) => {
    const { profile, opportunity, score } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        fallback: true,
        message: "Gemini API key not configured, fallback used",
      });
    }

    try {
      const prompt = `User profile:
Name: ${profile?.name || "Student"}
Role: ${profile?.role || "Builder"}
Skills: ${(profile?.skills || []).join(", ")}
Interests: ${(profile?.interests || []).join(", ")}
Goal: ${profile?.goal || "Collaborate and learn"}
Intent: ${profile?.intent || "Find opportunities"}

Opportunity:
Title: ${opportunity?.title}
Category: ${opportunity?.category || opportunity?.type}
Skills required: ${(opportunity?.skills || []).join(", ")}
Interests: ${(opportunity?.interests || []).join(", ")}
Description: ${opportunity?.description}

Calculated Match Score: ${score}%

Generate a concise, compelling 2-sentence explanation of why this is a great match, and a 1-sentence 'why_now' urgency statement.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING },
              why_now: { type: Type.STRING },
            },
            required: ["explanation", "why_now"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, ...parsed });
    } catch (error) {
      console.error("[Gemini Explain Match error]:", error);
      return res.status(500).json({ fallback: true, error: String(error) });
    }
  });

  // Direct HTML page routes
  const pages = [
    "LandingScreen.html",
    "ProfileCreation.html",
    "AiMatch.html",
    "OpportunityFeed.html",
    "Dashboard.html",
  ];

  // Legacy route alias for OppurtunityFeed.html typo
  app.get("/OppurtunityFeed.html", (req, res) => {
    res.redirect(301, "/OpportunityFeed.html");
  });

  pages.forEach((pageName) => {
    app.get(`/${pageName}`, (req, res) => {
      const filePath = path.join(process.cwd(), pageName);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      res.status(404).send(`Page ${pageName} not found`);
    });
  });

  // Root route renders LandingScreen.html
  app.get("/", (req, res) => {
    const filePath = path.join(process.cwd(), "LandingScreen.html");
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.sendFile(path.join(process.cwd(), "index.html"));
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
  }

  // Fallback handler
  app.use((req, res) => {
    const reqPath = req.path.replace(/^\//, "");
    const directFile = path.join(process.cwd(), reqPath);
    if (reqPath && fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
      return res.sendFile(directFile);
    }
    // Default fallback to LandingScreen.html
    const landingFile = path.join(process.cwd(), "LandingScreen.html");
    if (fs.existsSync(landingFile)) {
      return res.sendFile(landingFile);
    }
    res.sendFile(path.join(process.cwd(), "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aleropath Connect server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Aleropath server:", err);
  process.exit(1);
});
