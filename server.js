const express = require("express");
const { v4: generateUniqueId } = require("uuid");
const { pastes } = require("./database");

const app = express();
app.use(express.json());
app.use(express.static("public"));

/* ================= HEALTH CHECK ================= */
app.get("/api/healthz", (req, res) => {
  res.status(200).json({ ok: true });
});

/* ================= CREATE PASTE ================= */
app.post("/api/pastes", (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Content is required" });
  }

  if (ttl_seconds && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = generateUniqueId();
  const now = Date.now();

  pastes.set(id, {
    content,
    created_at: now,
    expires_at: ttl_seconds ? now + ttl_seconds * 1000 : null,
    max_views: max_views || null,
    view_count: 0
  });

  res.status(201).json({
    id,
    url: `${req.protocol}://${req.get("host")}/p/${id}`
  });
});

/* ================= FETCH PASTE (API) ================= */
app.get("/api/pastes/:id", (req, res) => {
  const paste = pastes.get(req.params.id);
  const now = Date.now();

  if (
    !paste ||
    (paste.expires_at && now > paste.expires_at) ||
    (paste.max_views && paste.view_count >= paste.max_views)
  ) {
    return res.status(404).json({ error: "Paste not found" });
  }

  paste.view_count++;

  res.json({
    content: paste.content,
    remaining_views: paste.max_views
      ? paste.max_views - paste.view_count
      : null,
    expires_at: paste.expires_at
      ? new Date(paste.expires_at).toISOString()
      : null
  });
});

/* ================= VIEW PASTE (HTML) ================= */
app.get("/p/:id", (req, res) => {
  const paste = pastes.get(req.params.id);
  const now = Date.now();

  if (
    !paste ||
    (paste.expires_at && now > paste.expires_at) ||
    (paste.max_views && paste.view_count >= paste.max_views)
  ) {
    return res.status(404).send("Paste not found");
  }

  paste.view_count++;

  res.send(`
    <html>
      <head><title>Paste</title></head>
      <body>
        <pre>${paste.content.replace(/</g, "&lt;")}</pre>
      </body>
    </html>
  `);
});

/* ================= ROOT ROUTE ================= */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pastebin Lite running on port ${PORT}`);
});
