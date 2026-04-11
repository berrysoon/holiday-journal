Here's your complete Project Brief ready to paste into a new Claude Project:

---

**PROJECT BRIEF — My Holiday Journal App**

**What the app does**
My Holiday Journal is a personal travel memory web app that allows users to record, organise and relive their holiday experiences. Each trip entry captures destination details, day-by-day activities, photos, reflections and ratings. The app displays all trips on a Memory Wall that can be filtered by country or year. Trips can be shared with friends via a generated link.

---

**Features Built**

*Trip Management*
- Add, edit and delete trips
- Trip title, start date, duration in days, season
- Single country or multi-country trips — if multi-country, user specifies number of countries and enters each country with its cities
- Companions, budget, highlights fields
- Cover photo — uploadable from device or linkable via Google Drive / Dropbox URL
- Trip status not used — kept simple

*Day by Day*
- Auto-generated day entries based on duration
- Each day has activity tags (Food, Culture, Adventure, Shopping, Rest, Beach, Nightlife, Nature)
- Activities text field
- Note text field
- Photos per day — upload from device (compressed) or link via Google Drive / Dropbox URL
- Linked photos show a 🔗 badge

*Reflections*
- Free text reflection
- 5-star rating
- Go again? (Yes / Maybe / No)

*Memory Wall*
- Card grid showing all trips
- Filter by Country dropdown — auto-populated from trip data
- Filter by Year dropdown — auto-populated from trip data
- Clear filters button
- Stats bar — Countries visited, Total trips, Total photos
- Storage usage bar — shows KB used out of 5MB with colour coding (green / orange / red)
- Backup section — Export JSON and Import JSON buttons

*Photo Gallery*
- Full screen slideshow of all photos in a trip
- Thumbnail strip at bottom
- Left / right navigation arrows
- Caption displayed below each photo
- Day number label

*Share Trip*
- Share button on trip detail page
- Generates a URL with trip data encoded in the hash
- Locally uploaded photos are stripped to keep URL short
- Google Drive linked photos are kept in the share link
- Linked cover photo is kept in the share link
- Friend opens URL and sees a read-only view with a banner saying it is shared
- Read-only view has a Go to App button

*Data Persistence*
- All data saved to browser localStorage automatically
- Export trips as dated JSON backup file
- Import JSON backup — merges with existing trips, no duplicates

---

**Tech Stack**

| Layer | Technology |
|---|---|
| Framework | React 18 with JSX, functional components, useState hooks |
| Build tool | Vite 8 |
| Runtime | Node.js v22 |
| Package manager | npm |
| Styling | Inline styles throughout — no CSS framework |
| Storage | Browser localStorage — 5MB limit |
| Photo compression | HTML5 Canvas API — client side, no server needed |
| Version control | Git local + GitHub |
| Hosting | Vercel — auto-deploys on every git push |
| Language | JavaScript only — no TypeScript |

---

**Key Design Decisions**

- Single file architecture — entire app is one App.jsx file (~800 lines). This was a deliberate choice for simplicity given it was built iteratively in Claude.ai chat
- No routing library — navigation managed with a simple view state variable (wall / form / detail)
- No backend — fully browser-based, no server, no database
- No CSS framework — all inline styles using a shared style object called I
- Photo compression on client side — Canvas API resizes to 800px wide at 60% JPEG quality for day photos, 900px at 65% for cover photos
- Share links encode trip data as base64 in the URL hash — no database needed, but photos are stripped to keep URL short
- localStorage chosen over a database to keep the app free and simple — acknowledged limitation is 5MB cap and no cross-device sync
- Multi-country trips store a countryList array — single country trips store country and city as flat strings for backward compatibility
- toDirectUrl helper function converts Google Drive and Dropbox share links to direct image URLs — defined at top level so all modals can access it

---

**What is Deployed and Where**

- **GitHub repo:** `berrysoon/holiday-journal`
- **Live URL:** Deployed on Vercel — `holiday-journal.vercel.app` (or similar auto-generated Vercel URL)
- **Branch:** main
- **Stable tag:** v1.0-stable tagged in Git — safe restore point before new features
- **Deployment method:** Automatic — every git push to main triggers Vercel redeploy within ~60 seconds

---

**Local Development**

- Project folder: `C:\Users\TANSK\Documents\holiday-journal`
- Run locally: `npm run dev` → opens at `http://localhost:5174`
- Push updates: `git add . → git commit -m "message" → git push`

---

**What I Want to Build Next**

*Immediate — in progress*
- World map view using React-Leaflet — pins for every country visited, clicking a pin shows trips for that country, toggle between card wall and map view. Currently being attempted via Claude Code tab in desktop app

*Short term*
- PDF export of individual trip report using jsPDF — include cover photo, dates, highlights, day entries, photos with captions, reflection and rating
- Stats page — total countries, total days travelled, total trips, most visited country
- Search across all trips — full text search on titles, activities, notes, captions
- Timeline view — all trips on a horizontal chronological timeline

*Future / bigger features*
- Cloudinary or Supabase photo storage — to overcome the 5MB localStorage limit and enable proper photo sharing
- Supabase database — cross-device sync, so the same trips show on phone and laptop
- User authentication — private login so multiple people can use the same deployment with their own data
- Real-time share link — instead of encoding in URL, store trip in database and share a short ID link
- Map integration with trip detail — click a country pin to open trip directly

*Separate project being planned*
- Memory Book app — users upload documents (PDF, Word, photos), Claude API processes and generates a beautiful shareable online memory book. This is a server-side app requiring Claude API integration, file processing and a proper database. Will be built as a completely separate Vercel project under the berrysoon GitHub account.

---

**How This App Was Built**
The app was built entirely through iterative conversation with Claude.ai in the browser — no local IDE used during development. All code changes were made by Claude, downloaded as files, and manually copied into the project folder. The app is now ready to transition to Claude Code for faster, more powerful feature development.

---
