# Pastebin-Lite

Pastebin-Lite is a simple web application that allows users to create
text pastes and share them using a unique URL.

Each paste can optionally expire based on:
- Time (TTL)
- Number of views

This project was created as a take-home assignment.

---

## How to Run the App Locally

### Requirements
- Node.js (v18 or later)
- npm

### Steps

1. Open terminal in the project folder
2. Install dependencies:
   npm install

3. Start the server:
   npm start

4. Open browser:
   http://localhost:3000

5. Health check:
   http://localhost:3000/api/healthz

Expected response:
{ "ok": true }

---

## Persistence Layer Used

The application uses an **in-memory data store (JavaScript Map)**.

### Why this was chosen
- Works reliably with Vercel serverless deployment
- Simple and fast
- Avoids issues with file-based databases in serverless environments

---

## Important Design Decisions

- Express.js used for simple and clean API routing
- UUIDs used to generate unique paste IDs
- Supports optional TTL and max view limits
- Paste content is safely rendered (no script execution)
- Separate API routes and HTML routes

---

## Live Demo

https://pastebin-lite-gamma.vercel.app

---

## Author

Shashirekha S
