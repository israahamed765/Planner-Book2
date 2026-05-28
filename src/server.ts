import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const BACKUP_FILE = path.join(process.cwd(), "db-backups.json");

// Parse JSON payloads up to 20MB for large diary entries and avatars
app.use(express.json({ limit: "20mb" }));

// Reads local JSON database
function readBackupDb(): Record<string, any> {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const content = fs.readFileSync(BACKUP_FILE, "utf-8");
      return JSON.parse(content || "{}");
    }
  } catch (err) {
    console.error("Error reading backup database:", err);
  }
  return {};
}

// Writes local JSON database
function writeBackupDb(db: Record<string, any>) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing backup database:", err);
  }
}

// REST Api: Retrieve backup for an identity
app.get("/api/backup", (req, res) => {
  const { identity } = req.query;
  if (!identity || typeof identity !== "string") {
    res.status(400).json({ success: false, error: "Missing identity query parameter" });
    return;
  }
  
  const db = readBackupDb();
  const userData = db[identity.trim()];
  if (userData) {
    res.json({ success: true, data: userData });
  } else {
    res.json({ success: false, data: null, message: "No backup found for this identity key" });
  }
});

// REST Api: Save backup for an identity
app.post("/api/backup", (req, res) => {
  const { identity, data } = req.body;
  if (!identity || typeof identity !== "string") {
    res.status(400).json({ success: false, error: "Missing identity in body" });
    return;
  }
  
  const db = readBackupDb();
  db[identity.trim()] = data;
  writeBackupDb(db);
  
  res.json({ success: true, message: "Backup synchronized successfully to node database server" });
});

// Setup dev server with Vite and fallback static routing for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
