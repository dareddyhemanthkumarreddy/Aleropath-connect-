/**
 * Aleropath Connect - Core Ecosystem State & Matching Engine
 * Shared client library for LandingScreen, ProfileCreation, AiMatch, OppurtunityFeed, and Dashboard
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    PROFILE: 'aleropathProfile',
    PROFILE_DRAFT: 'aleropathProfileDraft',
    OPPORTUNITIES: 'aleropathOpportunities',
    SAVED_OPPORTUNITIES: 'aleropathSavedOpportunities',
    CONNECTIONS: 'aleropathConnections',
    ACTIVITY: 'aleropathActivity',
    LAST_STRUCTURED: 'aleropathLastStructuredOpportunity',
    LAST_ACTION: 'aleropathLastOpportunityAction',
    ACTIVITY_CLEARED: 'aleropathDashboardActivityCleared',
    IS_SIGNED_IN: 'aleropathIsSignedIn'
  };

  // Safe localStorage helper
  const storage = {
    get(key, fallback = null) {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      } catch (e) {
        console.warn('[Aleropath Storage] read error:', e);
        return fallback;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn('[Aleropath Storage] write error:', e);
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  };

  // Fallback demo profile if user visits pages directly
  const DEFAULT_DEMO_PROFILE = {
    id: "p001",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    city: "Bengaluru",
    location: "Bengaluru, India",
    institution: "Demo Institute of Technology",
    field: "Computer Science",
    level: "Undergraduate — 3rd year",
    role: "Builder",
    skills: ["React", "TypeScript", "Node.js", "UI Design"],
    interests: ["AI", "EdTech", "Developer Communities"],
    customSkills: "FastAPI, Tailwind CSS",
    intent: "Find teammates",
    goal: "Build an AI-powered education project before December",
    opportunities: ["Projects", "Hackathons", "Events"],
    availability: "Weekends",
    collaboration: "Hybrid",
    experience_level: "Intermediate",
    idealTeammate: "A strong frontend/product collaborator who loves prototyping fast."
  };

  // Curated demo personas for quick sign in / testing
  const DEMO_PERSONAS = [
    DEFAULT_DEMO_PROFILE,
    {
      id: "p002",
      name: "Ananya Iyer",
      email: "ananya.iyer@example.com",
      city: "Mumbai",
      location: "Mumbai, India",
      institution: "National Institute of Design",
      field: "Design",
      level: "Undergraduate — 4th year",
      role: "Designer",
      skills: ["UI/UX Design", "Figma", "Design Systems", "Prototyping"],
      interests: ["HealthTech", "FinTech", "Accessibility"],
      intent: "Join an active project",
      goal: "Design a mobile wellness app for students",
      opportunities: ["Projects", "Hackathons"],
      availability: "10-15 hrs/week",
      collaboration: "Remote",
      experience_level: "Intermediate"
    },
    {
      id: "p003",
      name: "Rohan Joshi",
      email: "rohan.joshi@example.com",
      city: "Pune",
      location: "Pune, India",
      institution: "COEP Tech University",
      field: "Artificial Intelligence",
      level: "Masters — 1st year",
      role: "Researcher",
      skills: ["Python", "PyTorch", "LangChain", "LLMs", "RAG"],
      interests: ["GenAI", "NLP", "Open Source"],
      intent: "Find a hackathon team",
      goal: "Compete in GenAI hackathon and build a research tool",
      opportunities: ["Hackathons", "Events"],
      availability: "Full-time weekends",
      collaboration: "Hybrid",
      experience_level: "Advanced"
    },
    {
      id: "p004",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      city: "Delhi NCR",
      location: "Delhi, India",
      institution: "Delhi Technological University",
      field: "Information Technology",
      level: "Undergraduate — 3rd year",
      role: "Community Lead",
      skills: ["Event Management", "DevRel", "Community Building", "Public Speaking"],
      interests: ["Developer Communities", "Workshops", "Open Source"],
      intent: "Host workshops & mentor",
      goal: "Organize tech webinars and connect junior developers",
      opportunities: ["Events", "Mentorship"],
      availability: "Flexible",
      collaboration: "Remote",
      experience_level: "Intermediate"
    }
  ];

  // Cached seed dataset
  let cachedSeedData = null;

  async function loadSeedDataset() {
    if (cachedSeedData) return cachedSeedData;

    try {
      const res = await fetch('/seed_dataset_india_premium.json');
      if (res.ok) {
        cachedSeedData = await res.json();
        return cachedSeedData;
      }
    } catch (e) {
      console.warn('Could not fetch seed_dataset_india_premium.json directly, trying /api/seed-data');
    }

    try {
      const res = await fetch('/api/seed-data');
      if (res.ok) {
        cachedSeedData = await res.json();
        return cachedSeedData;
      }
    } catch (e) {
      console.warn('Fallback to embedded minimal seed dataset');
    }

    return { profiles: DEMO_PERSONAS, opportunities: [] };
  }

  function isSignedIn() {
    return storage.get(STORAGE_KEYS.IS_SIGNED_IN, false) === true || !!storage.get(STORAGE_KEYS.PROFILE);
  }

  function getProfile() {
    const saved = storage.get(STORAGE_KEYS.PROFILE);
    if (saved && saved.name) return saved;
    const draft = storage.get(STORAGE_KEYS.PROFILE_DRAFT);
    if (draft && draft.name) return draft;
    return DEFAULT_DEMO_PROFILE;
  }

  function saveProfile(profileData) {
    const enriched = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    storage.set(STORAGE_KEYS.PROFILE, enriched);
    storage.set(STORAGE_KEYS.IS_SIGNED_IN, true);
    storage.remove(STORAGE_KEYS.PROFILE_DRAFT);
    logActivity('edit_note', 'Profile signals updated', 'Just now', 'slate');
    return enriched;
  }

  function signIn(profileOrData) {
    let profileToUse = profileOrData;
    if (typeof profileOrData === 'string') {
      const matched = DEMO_PERSONAS.find(p => p.email.toLowerCase() === profileOrData.toLowerCase() || p.id === profileOrData);
      profileToUse = matched || {
        ...DEFAULT_DEMO_PROFILE,
        name: profileOrData.split('@')[0],
        email: profileOrData
      };
    }
    const saved = saveProfile(profileToUse || DEFAULT_DEMO_PROFILE);
    storage.set(STORAGE_KEYS.IS_SIGNED_IN, true);
    logActivity('login', `Signed in as ${saved.name}`, 'Just now', 'blue');
    return saved;
  }

  function signOut() {
    storage.remove(STORAGE_KEYS.IS_SIGNED_IN);
    storage.remove(STORAGE_KEYS.PROFILE);
    storage.remove(STORAGE_KEYS.PROFILE_DRAFT);
    showToast('Signed out successfully.', 'logout');
  }

  function resetDemoData() {
    storage.remove(STORAGE_KEYS.PROFILE);
    storage.remove(STORAGE_KEYS.PROFILE_DRAFT);
    storage.remove(STORAGE_KEYS.OPPORTUNITIES);
    storage.remove(STORAGE_KEYS.SAVED_OPPORTUNITIES);
    storage.remove(STORAGE_KEYS.CONNECTIONS);
    storage.remove(STORAGE_KEYS.ACTIVITY);
    storage.remove(STORAGE_KEYS.ACTIVITY_CLEARED);
    storage.remove(STORAGE_KEYS.IS_SIGNED_IN);
    showToast('Demo data reset to clean initial state.', 'refresh');
  }

  // Get all opportunities (seed dataset + user created)
  async function getAllOpportunities() {
    const seed = await loadSeedDataset();
    const seedOpps = (seed && seed.opportunities) ? [...seed.opportunities] : [];
    const userOpps = storage.get(STORAGE_KEYS.OPPORTUNITIES, []);
    
    // Merge user created on top, deduplicating by ID
    const map = new Map();
    userOpps.forEach(o => map.set(o.id, o));
    seedOpps.forEach(o => {
      if (!map.has(o.id)) map.set(o.id, o);
    });

    return Array.from(map.values());
  }

  // Get all people profiles (seed dataset + demo members)
  async function getAllProfiles() {
    const seed = await loadSeedDataset();
    return (seed && seed.profiles) ? seed.profiles : [DEFAULT_DEMO_PROFILE];
  }

  // Calculate profile completeness %
  function calculateProfileCompleteness(p) {
    if (!p) return 40;
    let score = 0;
    if (p.name && p.name.trim()) score += 10;
    if (p.email && p.email.trim()) score += 10;
    if (p.institution && p.institution.trim()) score += 10;
    if (p.role && p.role.trim()) score += 10;
    if (p.city || p.location) score += 10;
    if (p.skills && p.skills.length > 0) score += Math.min(20, p.skills.length * 5);
    if (p.interests && p.interests.length > 0) score += Math.min(15, p.interests.length * 4);
    if (p.intent && p.intent.trim()) score += 10;
    if (p.goal && p.goal.trim()) score += 10;
    if (p.availability) score += 5;
    return Math.min(100, Math.max(35, score));
  }

  /**
   * Deterministic Matching Algorithm
   * Weights:
   *  - skills: 35%
   *  - interests: 20%
   *  - intent: 15%
   *  - goal: 20%
   *  - location: 5%
   *  - availability: 5%
   * Output range: 60 - 99
   */
  function calculateMatch(profile, target) {
    const p = profile || DEFAULT_DEMO_PROFILE;
    const userSkills = (p.skills || []).map(s => s.toLowerCase().trim());
    if (p.customSkills) {
      p.customSkills.split(/[,/]+/).forEach(s => {
        const trimmed = s.trim().toLowerCase();
        if (trimmed) userSkills.push(trimmed);
      });
    }

    const userInterests = (p.interests || []).map(i => i.toLowerCase().trim());
    const userIntent = (p.intent || '').toLowerCase().trim();
    const userGoal = (p.goal || '').toLowerCase().trim();
    const userCity = (p.city || p.location || '').toLowerCase();
    const userAvailability = (p.availability || '').toLowerCase();

    // Target attributes
    const targetSkills = (target.skills || []).map(s => s.toLowerCase().trim());
    const targetInterests = (target.interests || []).map(i => i.toLowerCase().trim());
    const targetTags = (target.tags || []).map(t => t.toLowerCase().trim());
    const targetTitle = (target.title || target.name || '').toLowerCase();
    const targetDesc = (target.description || target.goal || target.subtitle || '').toLowerCase();
    const targetType = (target.type || target.category || '').toLowerCase();
    const targetCity = (target.city || target.location || '').toLowerCase();
    const targetMode = (target.mode || '').toLowerCase();
    const targetIntents = Array.isArray(target.intent_fit) 
      ? target.intent_fit.map(x => x.toLowerCase()) 
      : [(target.intent || '').toLowerCase()];

    // 1. SKILLS (35%)
    const matchedSkills = [];
    targetSkills.forEach(ts => {
      const match = userSkills.find(us => us.includes(ts) || ts.includes(us));
      if (match) matchedSkills.push(ts);
    });
    // check tags for skill mentions
    targetTags.forEach(tag => {
      if (!matchedSkills.includes(tag)) {
        const match = userSkills.find(us => us === tag || us.includes(tag) || tag.includes(us));
        if (match) matchedSkills.push(tag);
      }
    });
    
    let skillsScore = 0;
    if (targetSkills.length > 0) {
      skillsScore = Math.min(100, Math.round((matchedSkills.length / Math.max(1, Math.min(4, targetSkills.length))) * 100));
    } else {
      skillsScore = matchedSkills.length > 0 ? 85 : 60;
    }
    if (skillsScore < 40 && matchedSkills.length > 0) skillsScore = 65;

    // 2. INTERESTS (20%)
    const matchedInterests = [];
    targetInterests.forEach(ti => {
      const match = userInterests.find(ui => ui.includes(ti) || ti.includes(ui));
      if (match) matchedInterests.push(ti);
    });
    targetTags.forEach(tag => {
      if (!matchedInterests.includes(tag)) {
        const match = userInterests.find(ui => ui === tag || ui.includes(tag) || tag.includes(ui));
        if (match) matchedInterests.push(tag);
      }
    });
    let interestsScore = targetInterests.length > 0
      ? Math.min(100, Math.round((matchedInterests.length / Math.max(1, targetInterests.length)) * 100))
      : (matchedInterests.length > 0 ? 85 : 55);

    // 3. INTENT (15%)
    let intentScore = 50;
    if (userIntent.includes('teammate') || userIntent.includes('find teammates')) {
      if (targetIntents.some(i => i.includes('teammate')) || targetType.includes('project') || targetType.includes('person')) {
        intentScore = 95;
      }
    } else if (userIntent.includes('project') || userIntent.includes('join a project')) {
      if (targetType.includes('project') || targetIntents.some(i => i.includes('project'))) {
        intentScore = 98;
      }
    } else if (userIntent.includes('event') || userIntent.includes('discover events')) {
      if (targetType.includes('event') || targetType.includes('competition') || targetType.includes('workshop')) {
        intentScore = 98;
      }
    } else if (userIntent.includes('learn') || userIntent.includes('mentor')) {
      if (targetType.includes('mentor') || targetType.includes('workshop') || targetIntents.some(i => i.includes('mentor'))) {
        intentScore = 95;
      }
    } else {
      intentScore = 70;
    }

    // 4. GOAL (20%)
    let goalScore = 50;
    const goalWords = userGoal.split(/[\s,./-]+/).filter(w => w.length > 3);
    let goalHits = 0;
    goalWords.forEach(w => {
      if (targetTitle.includes(w) || targetDesc.includes(w) || targetTags.some(t => t.includes(w))) {
        goalHits++;
      }
    });
    if (goalWords.length > 0) {
      goalScore = Math.min(100, Math.round(55 + (goalHits / Math.min(4, goalWords.length)) * 45));
    } else {
      goalScore = 70;
    }

    // 5. LOCATION (5%)
    let locationScore = 60;
    if (targetCity.includes('remote') || targetMode.includes('online')) {
      locationScore = 95;
    } else if (userCity && targetCity && (userCity.includes(targetCity) || targetCity.includes(userCity))) {
      locationScore = 100;
    } else if (targetMode.includes('hybrid')) {
      locationScore = 80;
    } else {
      locationScore = 65;
    }

    // 6. AVAILABILITY (5%)
    let availabilityScore = 75;
    if (userAvailability.includes('flexible')) {
      availabilityScore = 95;
    } else if (userAvailability.includes('weekend') && (targetDesc.includes('weekend') || targetType.includes('event') || targetType.includes('competition'))) {
      availabilityScore = 95;
    } else if (userAvailability.includes('evening') || userAvailability.includes('hours')) {
      availabilityScore = 85;
    } else {
      availabilityScore = 80;
    }

    // Raw weighted sum
    const rawSum = (
      skillsScore * 0.35 +
      interestsScore * 0.20 +
      intentScore * 0.15 +
      goalScore * 0.20 +
      locationScore * 0.05 +
      availabilityScore * 0.05
    );

    // Normalize to 60 - 99 range
    const finalScore = Math.min(99, Math.max(60, Math.round(60 + (rawSum / 100) * 39)));

    // Generate deterministic readable explanations
    const matchedSkillsPretty = matchedSkills.map(s => s.replace(/\b\w/g, c => c.toUpperCase()));
    const matchedInterestsPretty = matchedInterests.map(i => i.replace(/\b\w/g, c => c.toUpperCase()));

    let reason = "";
    if (matchedSkillsPretty.length > 0 && matchedInterestsPretty.length > 0) {
      reason = `${finalScore}% match because your ${matchedSkillsPretty.slice(0, 2).join(' & ')} skills align directly with the opportunity and your ${matchedInterestsPretty[0]} interest matches the domain.`;
    } else if (matchedSkillsPretty.length > 0) {
      reason = `${finalScore}% match: strong skill overlap in ${matchedSkillsPretty.slice(0, 3).join(', ')} directly supports this opportunity's technical needs.`;
    } else if (matchedInterestsPretty.length > 0) {
      reason = `${finalScore}% match: your interest in ${matchedInterestsPretty.join(' and ')} fits the exact domain and mission of this opportunity.`;
    } else {
      reason = `${finalScore}% match: aligns well with your intent to ${p.intent || 'collaborate'} and complements your experience level.`;
    }

    let whyNow = `Active right now with ${target.spots || 'open'} spots available. Directly connects with your current focus on "${p.goal || 'building and learning'}".`;

    return {
      score: finalScore,
      signals: [
        ["Skills overlap", Math.min(99, Math.max(60, Math.round(60 + (skillsScore / 100) * 39)))],
        ["Goal alignment", Math.min(99, Math.max(60, Math.round(60 + (goalScore / 100) * 39)))],
        ["Interests fit", Math.min(99, Math.max(60, Math.round(60 + (interestsScore / 100) * 39)))],
        ["Intent fit", Math.min(99, Math.max(60, Math.round(60 + (intentScore / 100) * 39)))]
      ],
      matched_skills: matchedSkillsPretty,
      matched_interests: matchedInterestsPretty,
      intent_fit: `${intentScore}% fit for ${p.intent || 'your intent'}`,
      goal_fit: `${goalScore}% alignment with your target goal`,
      location_fit: `${locationScore}% location & mode compatibility`,
      reason: reason,
      why_now: whyNow
    };
  }

  // Build ranked match list for the current profile against all ecosystem targets
  async function computePersonalizedMatches(profile) {
    const p = profile || getProfile();
    const [opps, people] = await Promise.all([getAllOpportunities(), getAllProfiles()]);

    const formattedOpps = opps.map(o => {
      const match = calculateMatch(p, o);
      return {
        id: o.id,
        raw: o,
        type: o.type || 'project',
        typeLabel: (o.category || (o.type === 'event' ? 'Event' : o.type === 'mentor' ? 'Mentor' : 'Project')).toUpperCase(),
        title: o.title,
        subtitle: `${o.organization || o.city || 'Ecosystem'} · ${o.mode || 'Active'}`,
        score: match.score,
        tags: o.tags || o.skills || [],
        reason: match.reason,
        why_now: match.why_now,
        signals: match.signals,
        matched_skills: match.matched_skills,
        matched_interests: match.matched_interests,
        city: o.city || 'India',
        date: o.date || 'Upcoming',
        budget: o.budget_inr ? `₹${o.budget_inr.toLocaleString('en-IN')}` : null,
        spots: o.spots || null,
        cta: o.type === 'event' ? 'Save event' : o.type === 'mentor' ? 'Book session' : 'Join project',
        tone: o.type === 'event' ? 'cyan' : o.type === 'mentor' ? 'violet' : 'indigo'
      };
    });

    const formattedPeople = people.filter(person => person.id !== p.id && person.name !== p.name).map(person => {
      const match = calculateMatch(p, person);
      return {
        id: person.id,
        raw: person,
        type: 'person',
        typeLabel: 'PEOPLE',
        title: person.name,
        subtitle: `${person.role || 'Student'} · ${person.city || 'India'}`,
        score: match.score,
        avatar: (person.name || 'AC').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase(),
        tags: person.skills || [],
        reason: match.reason,
        why_now: match.why_now,
        signals: match.signals,
        matched_skills: match.matched_skills,
        matched_interests: match.matched_interests,
        city: person.city,
        cta: 'Connect',
        tone: 'blue'
      };
    });

    const allMatches = [...formattedOpps, ...formattedPeople].sort((a, b) => b.score - a.score);
    return allMatches;
  }

  // AI Auto-tagging helper (calls server API with client-side heuristic fallback)
  async function structureOpportunityWithAI(rawText) {
    if (!rawText || !rawText.trim()) throw new Error('Please provide opportunity text');

    // Try server-side Gemini API
    try {
      const res = await fetch('/api/gemini/tag-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText })
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.structured) {
          return json.structured;
        }
      }
    } catch (e) {
      console.info('[Aleropath AI] Server endpoint unavailable, using intelligent local structuring engine.', e);
    }

    // High-precision local heuristic parser fallback
    const text = rawText.trim();
    const lower = text.toLowerCase();

    let category = "Project";
    let type = "project";
    if (lower.includes("hackathon") || lower.includes("challenge") || lower.includes("jam")) {
      category = "Competition";
      type = "event";
    } else if (lower.includes("workshop") || lower.includes("masterclass") || lower.includes("training")) {
      category = "Workshop";
      type = "event";
    } else if (lower.includes("meetup") || lower.includes("conference") || lower.includes("summit") || lower.includes("gathering") || lower.includes("event")) {
      category = "Event";
      type = "event";
    } else if (lower.includes("mentor") || lower.includes("office hours") || lower.includes("advisory") || lower.includes("guidance")) {
      category = "Mentor";
      type = "mentor";
    } else if (lower.includes("community") || lower.includes("circle") || lower.includes("club")) {
      category = "Community";
      type = "event";
    } else if (lower.includes("looking for") || lower.includes("developer needed") || lower.includes("hiring") || lower.includes("intern")) {
      category = "Project";
      type = "project";
    }

    // Title extraction
    const firstSentence = text.split(/[.\n]/)[0].trim();
    let title = firstSentence.length > 10 && firstSentence.length < 80 
      ? firstSentence 
      : `${category} Opportunity: ${text.slice(0, 45)}...`;
    
    // Skills extraction
    const knownSkills = [
      "React", "TypeScript", "JavaScript", "Python", "FastAPI", "Node.js", "Flutter",
      "Dart", "Figma", "UI Design", "UX Research", "Machine Learning", "AI/ML",
      "RAG", "PyTorch", "AWS", "Cloud", "Java", "Spring Boot", "PostgreSQL",
      "SQL", "Pandas", "Cybersecurity", "Pitching", "Growth", "Marketing", "Web3", "Tailwind"
    ];
    const detectedSkills = [];
    knownSkills.forEach(s => {
      if (lower.includes(s.toLowerCase())) detectedSkills.push(s);
    });
    if (!detectedSkills.length) {
      detectedSkills.push(type === 'event' ? 'Networking' : 'Collaboration');
    }

    // Interests extraction
    const knownInterests = [
      "AI", "EdTech", "FinTech", "HealthTech", "Climate Tech", "Social Impact",
      "Startups", "Developer Communities", "Open Source", "Accessibility",
      "Generative AI", "Consumer Apps", "Civic Tech", "SaaS"
    ];
    const detectedInterests = [];
    knownInterests.forEach(i => {
      if (lower.includes(i.toLowerCase())) detectedInterests.push(i);
    });
    if (!detectedInterests.length) {
      detectedInterests.push(detectedSkills[0] || "Innovation");
    }

    // Location extraction
    const cities = ["Bengaluru", "Mumbai", "Hyderabad", "Pune", "Delhi NCR", "Chennai", "Kochi", "Ahmedabad", "Jaipur", "Kolkata", "Remote"];
    let detectedLocation = "Remote";
    cities.forEach(c => {
      if (lower.includes(c.toLowerCase())) detectedLocation = c;
    });

    let mode = detectedLocation === "Remote" ? "Online" : (lower.includes("in person") || lower.includes("offline") ? "In Person" : "Hybrid");

    // Dates
    const dateMatch = text.match(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?/i) ||
                      text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    const dateStr = dateMatch ? dateMatch[0] : "Upcoming (2026)";

    // Budget / Stipend / Price
    const inrMatch = text.match(/(?:₹|inr|rs\.?)\s*([\d,]+)/i);
    const usdMatch = text.match(/\$\s*([\d,]+)/);
    let budget = 0;
    if (inrMatch) budget = parseInt(inrMatch[1].replace(/,/g, ''), 10);
    else if (usdMatch) budget = parseInt(usdMatch[1].replace(/,/g, ''), 10) * 85;

    // Spots
    const spotsMatch = text.match(/(\d+)\s*(?:spots|openings|positions|members|contributors|attendees)/i);
    const spots = spotsMatch ? parseInt(spotsMatch[1], 10) : (type === 'event' ? 50 : 3);

    const tags = Array.from(new Set([...detectedSkills.slice(0, 3), ...detectedInterests.slice(0, 2), category]));

    return {
      title: title,
      category: category,
      type: type,
      description: text,
      skills: detectedSkills,
      interests: detectedInterests,
      location: detectedLocation,
      city: detectedLocation,
      mode: mode,
      date: dateStr,
      tags: tags,
      intent_fit: [type === 'event' ? 'Event' : 'Project', 'Teammate'],
      budget_inr: budget,
      spots: spots
    };
  }

  // Publish new structured opportunity into the live ecosystem
  function publishOpportunity(structuredData) {
    const userOpps = storage.get(STORAGE_KEYS.OPPORTUNITIES, []);
    const newRecord = {
      id: 'opp-' + Date.now(),
      type: structuredData.type || 'project',
      category: structuredData.category || 'Project',
      title: structuredData.title || 'Community Opportunity',
      organization: 'Community Member (You)',
      city: structuredData.city || structuredData.location || 'Remote',
      mode: structuredData.mode || 'Online',
      date: structuredData.date || 'Upcoming',
      description: structuredData.description || '',
      skills: structuredData.skills || [],
      interests: structuredData.interests || [],
      tags: structuredData.tags || [],
      intent_fit: structuredData.intent_fit || ['Project', 'Teammate'],
      budget_inr: Number(structuredData.budget_inr || 0),
      spots: Number(structuredData.spots || 1),
      status: 'Open',
      freshness: 'Just published',
      source: 'You'
    };

    userOpps.unshift(newRecord);
    storage.set(STORAGE_KEYS.OPPORTUNITIES, userOpps);
    storage.set(STORAGE_KEYS.LAST_STRUCTURED, {
      opportunity: newRecord,
      at: new Date().toISOString()
    });

    logActivity('add_circle', `Published “${newRecord.title}”`, 'Just now', 'blue');
    return newRecord;
  }

  // Save / Bookmark Opportunity
  function saveOpportunity(oppId, oppTitle) {
    const saved = storage.get(STORAGE_KEYS.SAVED_OPPORTUNITIES, []);
    if (!saved.includes(oppId)) {
      saved.push(oppId);
      storage.set(STORAGE_KEYS.SAVED_OPPORTUNITIES, saved);
      logActivity('bookmark', `Saved “${oppTitle || 'Opportunity'}”`, 'Just now', 'indigo');
    }
    return saved;
  }

  function unsaveOpportunity(oppId) {
    let saved = storage.get(STORAGE_KEYS.SAVED_OPPORTUNITIES, []);
    saved = saved.filter(id => id !== oppId);
    storage.set(STORAGE_KEYS.SAVED_OPPORTUNITIES, saved);
    return saved;
  }

  function getSavedOpportunities() {
    return storage.get(STORAGE_KEYS.SAVED_OPPORTUNITIES, []);
  }

  // Connect / Express Interest
  function recordConnection(targetId, targetName, type = 'person') {
    const connections = storage.get(STORAGE_KEYS.CONNECTIONS, []);
    const existing = connections.find(c => c.id === targetId);
    if (!existing) {
      connections.unshift({
        id: targetId,
        name: targetName,
        title: targetName,
        type: type,
        connectedAt: new Date().toISOString()
      });
      storage.set(STORAGE_KEYS.CONNECTIONS, connections);
      logActivity(
        type === 'person' ? 'person_add' : 'handshake',
        type === 'person' ? `Connected with ${targetName}` : `Applied to “${targetName}”`,
        'Just now',
        'violet'
      );
    }
    return connections;
  }

  function getConnections() {
    return storage.get(STORAGE_KEYS.CONNECTIONS, []);
  }

  // Activity Logger
  function logActivity(icon, text, time = 'Just now', tone = 'blue') {
    const list = storage.get(STORAGE_KEYS.ACTIVITY, []);
    list.unshift({ icon, text, description: text, time, tone, timestamp: Date.now() });
    storage.set(STORAGE_KEYS.ACTIVITY, list.slice(0, 20));
  }

  function getActivity() {
    if (storage.get(STORAGE_KEYS.ACTIVITY_CLEARED) === true) return [];
    const stored = storage.get(STORAGE_KEYS.ACTIVITY, null);
    if (stored) return stored;

    // Default rich activity timeline
    return [
      { icon: 'auto_awesome', text: 'AI calculated matches for your profile', description: 'AI calculated matches for your profile', time: 'Just now', tone: 'blue' },
      { icon: 'bookmark', text: 'Saved “AI Study Buddy — MVP Team”', description: 'Saved “AI Study Buddy — MVP Team”', time: '2 hours ago', tone: 'indigo' },
      { icon: 'person_add', text: 'Connected with Ananya Iyer (Product Design)', description: 'Connected with Ananya Iyer (Product Design)', time: 'Yesterday', tone: 'violet' },
      { icon: 'edit_note', text: 'Profile signals were updated', description: 'Profile signals were updated', time: '2 days ago', tone: 'slate' }
    ];
  }

  function clearActivity() {
    storage.set(STORAGE_KEYS.ACTIVITY_CLEARED, true);
    storage.set(STORAGE_KEYS.ACTIVITY, []);
  }

  // --- Phase 3: Gamification & Karma Index ---
  function calculateKarmaScore(profile) {
    const prof = profile || getProfile();
    const completeness = calculateProfileCompleteness(prof);
    const skillsCount = (prof.skills || []).length;
    const connections = getConnections().length;
    const savedCount = getSavedOpportunities().length;

    let score = 320; // Base Karma
    score += completeness * 4; // up to 400
    score += Math.min(skillsCount * 25, 175);
    score += Math.min(connections * 45, 180);
    score += Math.min(savedCount * 20, 100);

    const karma = Math.min(Math.max(score, 450), 985);

    let tier = "Rising Builder";
    if (karma >= 900) tier = "Ecosystem Legend";
    else if (karma >= 800) tier = "Top 5% Builder";
    else if (karma >= 650) tier = "Verified Innovator";

    const badges = [
      { name: "GitHub Verified", icon: "verified", tone: "blue" },
      { name: "Hackathon Finalist", icon: "military_tech", tone: "amber" },
      { name: "Top 5% Builder", icon: "workspace_premium", tone: "indigo" },
      { name: "Active Collaborator", icon: "diversity_3", tone: "emerald" }
    ];

    return { score: karma, tier, badges };
  }

  // --- Phase 1: Team Workspace & Chat Drawer ---
  function getWorkspace(targetId, targetTitle = "Team Workspace") {
    const all = storage.get(STORAGE_KEYS.WORKSPACES, {});
    if (all[targetId]) return all[targetId];

    const defaultWs = {
      id: targetId,
      title: targetTitle,
      createdAt: new Date().toISOString(),
      messages: [
        { id: "m1", sender: targetTitle.split(" ")[0] || "Teammate", text: "Hey! Excited to collaborate on this project.", time: "10:30 AM", isMe: false },
        { id: "m2", sender: "Aarav Mehta", text: "Awesome! I checked the match profile and our skills align really well.", time: "10:32 AM", isMe: true },
        { id: "m3", sender: targetTitle.split(" ")[0] || "Teammate", text: "Great! Let's set up the repo and prototype draft.", time: "10:35 AM", isMe: false }
      ],
      tasks: [
        { id: "t1", title: "Finalize AI Architecture & Gemini API Schema", done: true },
        { id: "t2", title: "Build Interactive UI Prototypes in Figma", done: false },
        { id: "t3", title: "Deploy Full-Stack Engine to Netlify", done: false }
      ],
      links: [
        { label: "GitHub Repository", url: "https://github.com/aleropath/community-engine", icon: "code" },
        { label: "Figma Workspace Canvas", url: "https://figma.com/@aleropath-ui", icon: "palette" },
        { label: "Discord Build Room", url: "https://discord.gg/aleropath", icon: "chat" }
      ]
    };

    all[targetId] = defaultWs;
    storage.set(STORAGE_KEYS.WORKSPACES, all);
    return defaultWs;
  }

  function sendWorkspaceMessage(targetId, text, senderName = "Aarav Mehta") {
    const all = storage.get(STORAGE_KEYS.WORKSPACES, {});
    const ws = getWorkspace(targetId);
    const newMsg = {
      id: "m_" + Date.now(),
      sender: senderName,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    ws.messages.push(newMsg);
    all[targetId] = ws;
    storage.set(STORAGE_KEYS.WORKSPACES, all);
    logActivity("chat", `Sent message in ${ws.title}`, "Just now", "blue");
    return ws;
  }

  function toggleWorkspaceTask(targetId, taskId) {
    const all = storage.get(STORAGE_KEYS.WORKSPACES, {});
    const ws = getWorkspace(targetId);
    ws.tasks = ws.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    all[targetId] = ws;
    storage.set(STORAGE_KEYS.WORKSPACES, all);
    return ws;
  }

  // --- Phase 2: Community Organizer Analytics & Tools ---
  function getOrganizerAnalytics() {
    const opps = storage.get(STORAGE_KEYS.OPPORTUNITIES, []);
    const connections = getConnections();

    return {
      communityName: "Aleropath India Builder Chapter",
      totalMembers: 248,
      activeEvents: 4 + opps.length,
      rsvpsTotal: 86 + connections.length * 3,
      skillDistribution: [
        { skill: "AI / ML & LLMs", percent: 38, count: 94 },
        { skill: "Frontend & UI Design", percent: 28, count: 70 },
        { skill: "Backend & Cloud", percent: 22, count: 54 },
        { skill: "DevRel & Operations", percent: 12, count: 30 }
      ],
      recentRSVPs: [
        { name: "Ananya Iyer", role: "UI/UX Designer", event: "National AI Buildathon '26", status: "Confirmed", time: "10 mins ago" },
        { name: "Rohan Joshi", role: "ML Researcher", event: "Bengaluru Dev Conclave", status: "Confirmed", time: "1 hour ago" },
        { name: "Priya Sharma", role: "Community Host", event: "Web3 & AI HackNight", status: "Pending", time: "3 hours ago" }
      ]
    };
  }

  // --- Phase 4: Team Assembler Wizard ---
  async function assembleTeam(requestedRoles = ["UI/UX Designer", "AI / ML Engineer", "Backend Developer"]) {
    const profiles = await getAllProfiles();
    const activeProfile = getProfile();

    const team = requestedRoles.map(role => {
      const candidates = profiles.filter(p => p.id !== activeProfile.id);
      const match = candidates.find(c =>
        (c.role && c.role.toLowerCase().includes(role.toLowerCase())) ||
        (c.skills && c.skills.some(s => role.toLowerCase().includes(s.toLowerCase())))
      ) || candidates[Math.floor(Math.random() * candidates.length)] || DEMO_PERSONAS[1];

      return {
        requestedRole: role,
        candidate: match,
        matchScore: Math.floor(88 + Math.random() * 11), // 88-98% fit
        fitReason: `Optimal match: ${match.name} brings strong ${match.skills ? match.skills.slice(0, 2).join(', ') : 'technical'} capabilities for this hackathon role.`
      };
    });

    return team;
  }

  // Toast Notification Helper
  function showToast(message, icon = 'check_circle') {
    let toast = document.getElementById('aleropath-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'aleropath-toast';
      toast.className = 'pointer-events-none fixed bottom-6 left-1/2 z-[999] -translate-x-1/2 transition-all duration-300 transform opacity-0 translate-y-2';
      toast.innerHTML = `
        <div class="flex items-center gap-2.5 rounded-2xl bg-[#07142f] px-5 py-3.5 text-xs font-bold text-white shadow-2xl border border-blue-400/20">
          <span class="material-symbols-outlined text-[19px] text-blue-300" id="aleropath-toast-icon">check_circle</span>
          <span id="aleropath-toast-text">Action completed</span>
        </div>
      `;
      document.body.appendChild(toast);
    }

    const textEl = toast.querySelector('#aleropath-toast-text');
    const iconEl = toast.querySelector('#aleropath-toast-icon');
    if (textEl) textEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;

    toast.classList.remove('opacity-0', 'translate-y-2', 'hidden');
    toast.classList.add('opacity-100', 'translate-y-0');

    clearTimeout(window.__aleropathToastTimer);
    window.__aleropathToastTimer = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-2');
    }, 2800);
  }

  // Expose global Aleropath API
  window.Aleropath = {
    KEYS: STORAGE_KEYS,
    storage,
    isSignedIn,
    signIn,
    signOut,
    resetDemoData,
    DEMO_PERSONAS,
    getProfile,
    saveProfile,
    loadSeedDataset,
    getAllOpportunities,
    getAllProfiles,
    calculateProfileCompleteness,
    calculateMatch,
    computePersonalizedMatches,
    structureOpportunityWithAI,
    publishOpportunity,
    saveOpportunity,
    unsaveOpportunity,
    getSavedOpportunities,
    recordConnection,
    getConnections,
    logActivity,
    getActivity,
    getActivities: getActivity,
    clearActivity,
    calculateKarmaScore,
    getWorkspace,
    sendWorkspaceMessage,
    toggleWorkspaceTask,
    getOrganizerAnalytics,
    assembleTeam,
    showToast
  };

})(window);
