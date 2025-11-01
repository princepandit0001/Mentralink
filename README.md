# Mentralink — student community (prototype)

This is a lightweight, client-side prototype of Mentralink: an online student community for Q&A, mentorship, collaboration, and events.

Features
- Q&A feed: post questions, search, upvote and view details (persisted to localStorage)
- Mentors: add mentor cards and contact links
- Events: create/list events and AMAs
- Collaboration: create groups for projects/hackathons

Files
- `index.html` — main single-page UI
- `css/styles.css` — styles and responsive layout
- `js/app.js` — simple app logic, sample data and localStorage persistence

Run
1. Open `index.html` in your browser. (Double-click or open with your preferred browser.)
2. For a simple local server (recommended to avoid some browser restrictions), run from PowerShell in this folder:

```powershell
# start a simple HTTP server (Python must be installed)
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Notes & next steps
- This is a client-only prototype. For production you would add a backend (auth, DB), file uploads, real-time features (WebSocket), pagination, and input sanitization on server-side.
- Consider adding user accounts, edit/delete permissions, and better UI accessibility.

License: MIT (prototype)
