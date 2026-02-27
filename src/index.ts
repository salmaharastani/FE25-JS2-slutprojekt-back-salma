import fs from "fs";
import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "../data/db.json");

const readDb = () => {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

const writeDb = (data: any) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// ================= TEST =================
app.get("/", (req: Request, res: Response) => {
  res.send("Backend running 🚀");
});

// ================= MEMBERS =================
app.get("/members", (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.members);
});

app.post("/members", (req: Request, res: Response) => {
  const db = readDb();

  const newMember = {
    id: Date.now(),
    name: req.body.name,
    category: req.body.category
  };

  db.members.push(newMember);
  writeDb(db);

  res.status(201).json(newMember);
});

// ================= ASSIGNMENTS =================
app.get("/assignments", (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.assignments);
});

app.post("/assignments", (req: Request, res: Response) => {
  const db = readDb();

  const newAssignment = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    status: "new",
    assignedTo: null,
    timestamp: new Date().toISOString()
  };

  db.assignments.push(newAssignment);
  writeDb(db);

  res.status(201).json(newAssignment);
});

// ⭐ ASSIGN MEMBER
app.patch("/assignments/:id/assign", (req: Request, res: Response) => {
  const db = readDb();
  const id = Number(req.params.id);

  const assignment = db.assignments.find((a: any) => a.id === id);

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  assignment.assignedTo = req.body.memberId;
  writeDb(db);

  res.json(assignment);
});

// ⭐ CHANGE STATUS
app.patch("/assignments/:id/status", (req: Request, res: Response) => {
  const db = readDb();
  const id = Number(req.params.id);

  const assignment = db.assignments.find((a: any) => a.id === id);

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  assignment.status = req.body.status;
  writeDb(db);

  res.json(assignment);
});

// ⭐ DELETE SPECIFIC ASSIGNMENT
app.delete("/assignments/:id", (req: Request, res: Response) => {
  const db = readDb();
  const id = Number(req.params.id);

  const index = db.assignments.findIndex((a: any) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const deleted = db.assignments.splice(index, 1)[0];
  writeDb(db);

  res.json({ message: "Deleted", deleted });
});

// ⭐ DELETE ALL ASSIGNMENTS (optional)
app.delete("/assignments", (req: Request, res: Response) => {
  const db = readDb();
  db.assignments = [];
  writeDb(db);

  res.json({ message: "All assignments deleted" });
});

// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});