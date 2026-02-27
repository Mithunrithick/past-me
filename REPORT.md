# REPORT: PastMe — AI Journal

## ACKNOWLEDGEMENT
This report documents the PastMe project — a reactive, web-based AI-assisted journaling application. It summarizes objectives, design, implementation details, testing, and maintenance guidance based on the current codebase.

## ABSTRACT
PastMe is a frontend-focused React application that integrates with Firebase for persistence and serverless endpoints for AI processing. The app provides a "LOG ENTRY" UI that accepts typed and speech-captured input, sends entries to a backend AI processing endpoint, and stores enriched metadata (emotion, summary, keywords) alongside raw content in Firestore.

---

## Chapter I: Introduction

### 1.1 An Overview
PastMe is a single-page React application built with Vite. The UI follows a sci-fi aesthetic and is implemented using React components under src/. Key features:
- Text journal entry input with visual effects and custom styling.
- Optional speech-to-text capture using the browser SpeechRecognition API.
- AI enrichment of entries via serverless endpoints (see /api/*).
- Storage of entries and metadata in Firebase Firestore.

### 1.2 Objectives of the project
- Provide a fast, immersive journaling UI.
- Capture entries via keyboard and microphone (where supported).
- Enrich entries using AI (emotion, summary, keywords) and store them.
- Make the system lightweight and cache-friendly (rateLimitedFetch).

### 1.3 Organization of the project
- index.html: application entry, mounts React app.
- src/main.jsx, App.jsx: React app bootstrapping and routing.
- src/components/: UI components (Journal, Galaxy panels, etc.).
- src/firebase.js: Firebase initialization and helpers.
- api/: serverless functions (analyzeIdentity.js, processEntry.js, askOracle.js, getReflection.js).
- package.json, build tooling via Vite.

### 1.4 Scope of the system
Client-centric journaling with cloud persistence and AI processing. Not intended as a full analytics platform — primary focus is personal reflection and lightweight AI insights.

---

## Chapter II: System Analysis

### 2.1 Existing System
The codebase contains a modern React frontend using functional components and hooks. Key implementation details observed:
- Journal.jsx: main log-entry UI component that handles text input, optional speech capture, and sending entries to an API endpoint. It uses Typewriter for animated AI reply display and lucide-react for icons.
- Styling: src/index.css sets global look-and-feel (fonts, dark background, scrollbars, texture overlays) and uses Tailwind directives (@tailwind base/components/utilities).
- Persistence: Firebase Firestore is used for storing user entries (addDoc to collection(db, 'users', user.uid, 'entries')).
- APIs: The client posts entry text to /api/processEntry to get an AI-enriched JSON reply (code under api/ folder).

Browser speech recognition compatibility is handled with a runtime check: const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition. The component constructs and manages a SpeechRecognition instance with continuous listening and interim results.

### 2.2 Proposed System (if extending)
- Add explicit error handling and user-facing messages for API and Firebase failures.
- Add an entries listing page with sentiment/emotion visualizations.
- Add unit/integration tests for main components and API routes.

### 2.3 Hardware Specification
No special hardware required beyond a modern desktop or mobile device with a browser. Microphone required for speech capture.

### 2.4 Software Specification
- React (Vite) frontend
- Tailwind CSS utility integration (index.css contains tailwind directives)
- Firebase Firestore for persistence
- Serverless AI processing endpoints (Node handlers under api/)
- Browser SpeechRecognition API for speech input

---

## Chapter III: Design and Development

### 3.1 Design process
Design follows component-driven UI with the following responsibilities:
- Journal.jsx: Collects text, handles speech input lifecycle, calls rateLimitedFetch to /api/processEntry, parses AI response (robustly handling code fences and malformed JSON), and writes entries to Firestore with metadata.

Implementation notes from Journal.jsx:
- SpeechRecognition setup is performed inside useEffect and stored in a micRef.
- mic.continuous and mic.interimResults are enabled to receive streamed results.
- onresult handler appends final transcripts to the textarea content.
- Before saving an entry, the component ensures recording is stopped and disables the UI while processing.
- rateLimitedFetch is used for caching/throttling API calls (see src/utils/apiCache.js).
- The AI endpoint may return a markdown fenced JSON block; the client strips ```json or ``` and attempts JSON.parse; on failure it falls back to a neutral structure.
- addDoc stores content and metadata: createdAt (serverTimestamp), emotion, summary, keywords, sentiment_score mapped to sentiment.

#### 3.1.1 Data Base Design
Data is stored per user under Firestore collections:
- Collection: users -> Document: {user.uid} -> Subcollection: entries
Each entry document fields:
- content: string (raw user text)
- createdAt: Firestore serverTimestamp
- emotion: string (e.g., "Neutral")
- summary: short summary string
- keywords: array of strings
- sentiment: numeric score (client maps aiJson.sentiment_score to sentiment)

#### 3.1.2 Input Design
Inputs supported:
- Keyboard textarea input (primary)
- Microphone input via SpeechRecognition (if browser supports it); toggle button in the UI manages start/stop.

Speech handling specifics:
- The code appends only final transcription segments (latestResult.isFinal). Interim results are ignored for auto-appending.
- The mic is created at component mount and aborted at cleanup.

#### 3.1.3 Output Design
- AI Reply area displays a typed animation using Typewriter that renders the AI message.
- Saved entries are persisted to Firestore and can be displayed elsewhere in the app (other components like MemoryGalaxy or panels likely present).

---

## Chapter IV: Testing and Implementation

### 4.1 System Testing
Manual test checklist derived from code behavior:
- Start app via Vite; verify index.html mounts src/main.jsx to #root.
- Create a log entry and hit "Upload to Galaxy": UI should disable, call /api/processEntry, and on success store doc in Firestore.
- Test speech capture on browsers that implement SpeechRecognition (Chrome/Edge): pressing mic toggles recording and appends final transcripts.
- Test AI reply display for both JSON-wrapped responses and plain text. The client strips ```json fences and handles malformed JSON gracefully.

### 4.2 Quality Assurance
- Validate Firestore writes include expected metadata fields.
- Validate UI responsiveness and keyboard / mic interactions.
- Validate rate-limiting and caching logic (src/utils/apiCache.js) to ensure API isn't spammed.

### 4.3 System Implementation
Deployment notes:
- Static site served via Vite builds; serverless API handlers should be deployed to a Node-capable cloud (Vercel/Netlify functions) matching the client endpoints (/api/processEntry etc.).
- Firebase configuration must be provided (src/firebase.js) and proper security rules for users/entries enforced.

### 4.4 System Maintenance
- Keep the AI server endpoints documented and stable in their output JSON schema (reply, emotion, summary, keywords, sentiment_score).
- Monitor and handle SpeechRecognition cross-browser differences; provide a fallback or UX hint if unsupported.

---

## Chapter V: Conclusion
PastMe provides a tightly focused journaling experience with AI augmentation and cloud persistence. The current codebase demonstrates a pragmatic and robust approach to handling both typed and speech input plus resilient AI response parsing.

### Scope of Future Development
- UI for browsing and searching past entries
- Visualizations for emotion/sentiment trends
- Offline caching and sync
- User settings for AI behavior and privacy controls

---

## Bibliography
- Project source files in repository
- Browser SpeechRecognition API docs
- Firebase Firestore documentation

---

## Annexure
- Key source references and implementation excerpts are listed under "Source Code" below.

## Source Code
Primary files referenced when authoring this report:
- https://github.com/Mithunrithick/past-me/blob/main/src/index.css
- https://github.com/Mithunrithick/past-me/blob/main/src/Journal.jsx
- https://github.com/Mithunrithick/past-me/blob/main/index.html

Other notable folders:
- api/: serverless handlers for AI processing
- src/components/: UI components and Galaxy visualization
- src/firebase.js: Firebase initialization
- src/utils/apiCache.js: rate-limited fetch and caching

## Screens
The UI contains a LOG ENTRY panel (Journal.jsx) with:
- Header with date and title
- Large textarea with glass styling and sci-fi texture
- Upload and mic buttons
- AI reply area rendered with typewriter animation

## Tables
Example Firestore entry document structure:
| Field | Type | Example |
|---|---:|---|
| content | string | "I felt happy today..." |
| createdAt | timestamp | serverTimestamp |
| emotion | string | "Happy" |
| summary | string | "Short summary of entry" |
| keywords | array | ["work","reflection"] |
| sentiment | number | 0.12 |

## Reports
- This generated report is based on the current codebase and aims to replace the previous placeholder with an implementation-aligned document.

---

Notes on implementation specifics (excerpts):
- index.html is the Vite entry that mounts the React app by loading /src/main.jsx.
- src/index.css sets global fonts (Rajdhani, Share Tech Mono), dark theme, and custom scrollbar & texture classes used across the UI.
- Journal.jsx handles speech recognition lifecycle, sanitizes AI JSON replies (strips code fences), uses addDoc to store entry documents, and presents AI replies via Typewriter.

