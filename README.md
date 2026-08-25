# ⚡ Aleropath Connect — The Community Engine

<div align="center">

<p align="center">
  <img src="https://img.shields.io/badge/Aleropath-Connect%20v2.5%20Winner%20Edition-0052FF?style=for-the-badge&logo=rocket&logoColor=white" alt="Aleropath Version" />
  <img src="https://img.shields.io/badge/Google%20Gemini-3.7%20Flash%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Powered by Gemini" />
  <img src="https://img.shields.io/badge/Netlify-Ready-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Netlify Deployment" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

### **AI-Powered Opportunity Graph, Explainable Teammate Matching & Real-Time Builder Workspace**
*Transforming fragmented student community listings into an intelligent discovery, matching, and collaboration ecosystem across Indian builder hubs.*

[Explore Features](#-core-capabilities) • [System Architecture](#-system-architecture) • [Matching Math](#-matching-engine-mathematical-specification) • [Organizer Portal](#-organizer-portal--analytics) • [Netlify Deployment](#-netlify-deployment-guide) • [Hackathon Pitch](#-2-minute-hackathon-judging-pitch)

</div>

---

## 📖 Challenge Brief & Core Problem

Student communities around technology, hackathons, open-source projects, and entrepreneurship are growing rapidly across India. However, opportunities and member interactions are fragmented across **WhatsApp groups, Instagram stories, Discord servers, Telegram channels, and spreadsheets**.

Because of this fragmentation:
1. **Students miss high-value opportunities** and struggle to find matched project teammates or verified mentors.
2. **Community organizers lack engagement insights** and struggle to broadcast events to the right candidates.
3. **No central trust mechanism** exists to verify proof-of-work or builder reputation.

### 🎯 The Aleropath Solution
**Aleropath Connect** transforms scattered unstructured text into a structured, unified opportunity graph using **Google Gemini 3.7/Flash AI** combined with a **multi-vector deterministic matching engine (60–99% Explainable AI)**, an interactive **Team Workspace**, and a dedicated **Community Organizer Portal**.

```
  [Messy WhatsApp / Discord / Instagram Copy-Paste]
                         │
                         ▼
       ┌────────────────────────────────────┐
       │   Gemini Flash Auto-Tagging & NER  │
       │   • Categorization & Entity Extraction │
       └─────────────────┬──────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────┐
  │   Aleropath Multi-Vector Matching Engine        │
  │   • Skills (35%)       • Goal Relevance (20%)   │
  │   • Domain (20%)       • Intent Fit (15%)       │
  │   • Location (5%)      • Availability (5%)      │
  └───────────────────────┬─────────────────────────┘
                         │
                         ▼
 ┌──────────────────────────────────────────────────┐
 │  Ranked Matches + Explainable AI + Team Workspace  │
 └──────────────────────────────────────────────────┘
```

---

## ✨ Core Capabilities & Winning Features

### 1. ⚡ Gemini-Powered Opportunity Parser
- Accepts raw, messy opportunity descriptions (e.g. from WhatsApp or Slack posts) and structures them into standardized JSON schemas:
  - Technical & Soft Skills (e.g. `React`, `Python`, `LLMs`, `Figma`)
  - Target Domains (`AI/ML`, `FinTech`, `EdTech`, `Web3`)
  - Opportunity Classification (`Event`, `Project`, `Mentor`, `Competition`, `Workshop`)
  - Modality & City (`Bengaluru`, `Mumbai`, `Delhi NCR`, `Remote`)
  - Budget / Prizes (INR) & Open Openings

### 2. 🎯 Multi-Vector Matching Engine & Explainable AI (XAI)
- **Deterministic Fit Scoring**: Computes 60%–99% compatibility scores combining weighted Jaccard set similarities with domain intent heuristics.
- **Explainable AI (XAI)**: Generates human-readable breakdowns explaining *why* a candidate matches a specific hackathon, project, or mentor, complete with a *"Why Now"* temporal urgency score.

### 3. 💬 Phase 1: Live Team Workspace & Collaboration Drawer
- Every match card or project application connects into an interactive **Team Workspace**:
  - **Live Chat Thread**: Contextual message threads for real-time team coordination.
  - **Task Board**: Interactive checklist to assign and track project milestones.
  - **Shared Project Links**: Quick access to GitHub repositories, Figma canvases, and Discord channels.

### 4. 📊 Phase 2: Community Organizer Portal & Analytics
- Header toggle enables switching between **Builder View** and **Organizer View**:
  - **Community Analytics**: Track Total Chapter Members, Active RSVPs, and Chapter Growth.
  - **Skill Distribution Radar**: Visual breakdowns of member skills (`AI/ML 38%`, `UI/UX 28%`, `Backend 22%`, `DevRel 12%`).
  - **Opportunity Broadcast Tool**: Create official campus challenges with live Gemini auto-tagging.
  - **RSVP Management**: Review attendee applications in real time.

### 5. 🛡️ Phase 3: Gamification & Proof-of-Work Karma Index
- **Community Karma Score** (0–1000 scale) calculated dynamically from profile completion, skills, connections made, and saved items.
- **Verified Badges**: `GitHub Verified`, `Hackathon Finalist`, `Top 5% Builder`, `Verified Mentor`.

### 6. 🤝 Phase 4: AI Hackathon Team Assembler Wizard
- Multi-role team formation tool: Select missing hackathon roles (e.g., 1 Designer + 1 AI Engineer + 1 Backend Dev), and the AI automatically selects the top-ranked candidates to balance the team.

---

## 🏗 System Architecture

---
config:
  layout: elk
  theme: mc
---
graph TB
    subgraph ClientLayer["Client Layer"]
        LandingScreen["Landing Screen"]
        ProfileCreation["Profile Creation"]
        AiMatch["AI Match"]
        OpportunityFeed["Opportunity Feed"]
        Dashboard["Dashboard"]
    end

    subgraph SharedCore["Shared Core Client Engine"]
        CoreJS["aleropath-core.js"]
        KarmaIndex["Karma Index"]
        TeamWorkspace["Team Workspace"]
        Assembler["Assembler"]
        CoreJS --> KarmaIndex
        CoreJS --> TeamWorkspace
        CoreJS --> Assembler
    end

    subgraph FullStackServer["Full-Stack Express Server"]
        ServerTS["server.ts"]
        GeminiTag["/api/gemini/tag-opportunity"]
        GeminiExplain["/api/gemini/explain-match"]
        SeedData["/api/seed-data"]
        ServerTS --> GeminiTag
        ServerTS --> GeminiExplain
        ServerTS --> SeedData
    end

    subgraph ExternalCloud["External Cloud & Edge Layer"]
        GeminiAPI["Google Gemini 3.7 Flash AI API"]
        NetlifyDeploy["Netlify Deployment"]
    end

    LandingScreen --> CoreJS
    ProfileCreation --> CoreJS
    AiMatch --> CoreJS
    OpportunityFeed --> CoreJS
    Dashboard --> CoreJS

    CoreJS --> ServerTS
    GeminiTag --> GeminiAPI
    GeminiExplain --> GeminiAPI
    SeedData --> GeminiAPI

    ServerTS --> NetlifyDeploy
    ClientLayer --> NetlifyDeploy

    classDef client stroke:#3b82f6,fill:#eff6ff
    classDef core stroke:#8b5cf6,fill:#faf5ff
    classDef server stroke:#f97316,fill:#fff7ed
    classDef external stroke:#06b6d4,fill:#ecfeff
    classDef process stroke:#6366f1,fill:#eef2ff

    class LandingScreen,ProfileCreation,AiMatch,OpportunityFeed,Dashboard client
    class CoreJS,KarmaIndex,TeamWorkspace,Assembler core
    class ServerTS,GeminiTag,GeminiExplain,SeedData server
    class GeminiAPI,NetlifyDeploy external
---
---
## 🧮 Matching Engine Mathematical Specification

The Aleropath matching engine computes a deterministic compatibility score $S(P, O) \in [0.60, 0.99]$ between a Builder Profile $P$ and an Opportunity/Candidate Record $O$:

$$S(P, O) = w_s \cdot S_{\text{skills}} + w_i \cdot S_{\text{interests}} + w_g \cdot S_{\text{goal}} + w_t \cdot S_{\text{intent}} + w_l \cdot S_{\text{location}} + w_a \cdot S_{\text{availability}}$$

Where the weight configuration vector is defined as:
* $w_s = 0.35$ (Technical Skills Jaccard similarity)
* $w_g = 0.20$ (Goal keyword match & overlap)
* $w_i = 0.20$ (Domain interest Jaccard similarity)
* $w_t = 0.15$ (Intent classification alignment)
* $w_l = 0.05$ (Location proximity / Remote match)
* $w_a = 0.05$ (Availability heuristic match)

Jaccard Similarity for skill set $A$ and $B$:

$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

---

## 🌐 Complete 5-View Application Suite

| View | Basename Link | Description |
| :--- | :--- | :--- |
| **Landing & Hub** | [`LandingScreen.html`](file:///c:/PROJECTS/Hackathons/Community-Engine/MVP/LandingScreen.html) | Hero section, live personalized match previews, test persona switcher, feature highlights. |
| **Profile Creation** | [`ProfileCreation.html`](file:///c:/PROJECTS/Hackathons/Community-Engine/MVP/ProfileCreation.html) | 4-step wizard capturing builder skills, college details, goals, and availability preferences. |
| **AI Match Engine** | [`AiMatch.html`](file:///c:/PROJECTS/Hackathons/Community-Engine/MVP/AiMatch.html) | Multi-category match feeds, Team Workspace Drawer, and Assemble Hackathon Team Wizard. |
| **Opportunity Feed** | [`OpportunityFeed.html`](file:///c:/PROJECTS/Hackathons/Community-Engine/MVP/OpportunityFeed.html) | Real-time community opportunity board with "AI Recommended For You" carousel and Gemini auto-tagging modal. |
| **Builder & Organizer Portal** | [`Dashboard.html`](file:///c:/PROJECTS/Hackathons/Community-Engine/MVP/Dashboard.html) | Dual-mode dashboard featuring Builder Analytics, Karma Index, and Community Organizer Management. |

---

## 🚀 Netlify Deployment Guide

The project includes built-in Netlify static bundling and route redirection (`netlify.toml`).

### Option 1: Deploy via Netlify CLI (Fastest)
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build production assets
npm run build

# 3. Deploy to Netlify Free Tier
netlify deploy --prod --dir=dist
```

### Option 2: Deploy via GitHub / Netlify Web UI
1. Push this repository to GitHub.
2. Log into [Netlify Dashboard](https://app.netlify.com).
3. Click **"Add new site"** → **"Import from existing project"** → Select your repository.
4. Build settings will auto-detect from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. In Netlify Environment Variables, add:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```
6. Click **Deploy Site**!

---

## 🎤 2-Minute Hackathon Judging Pitch

> **"Hello judges! We created Aleropath Connect to solve the core problem of community fragmentation.**
>
> **Right now, student opportunities are lost in noisy WhatsApp groups and Discord channels. Aleropath changes this in 3 steps:**
>
> 1. **Instant AI Auto-Tagging**: Anyone can paste a raw WhatsApp/Discord post into our Opportunity Feed. Google Gemini extracts required skills, tags, dates, and category in seconds.
> 2. **Multi-Vector Matching**: Our engine computes a 60–99% explainable fit score for every builder based on skills, domain goals, and intent.
> 3. **End-to-End Collaboration**: Unlike social networks where connections stall, clicking 'Connect' opens an instant **Team Workspace** with live chat, task checklists, and GitHub/Figma repos. Plus, our **Organizer Portal** gives community leads real-time analytics on member skills and event RSVPs.
>
> **Aleropath Connect isn't just another community platform — it's the intelligence layer that helps communities discover, connect, and grow together."**

---

## 🛠 Local Setup & Running

```bash
# Install dependencies
npm install

# Run TypeScript linter
npm run lint

# Build production bundle & copy static assets
npm run build

# Start local server
npm run dev
# Server will run on http://localhost:3000
```
