import fs from "fs";
import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

/** ===== Types ===== */
type Category = "ux" | "frontend" | "backend";
type Status = "new" | "doing" | "done";

interface Member {
  id: number;
  name: string;
  category: Category;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  category: Category;
  status: Status;
  assignedTo: number | null;
  timestamp: string; // ISO string
}

interface Db {
  members: Member[];
  assignments: Assignment[];
}

/** ===== Helpers ===== */
const CATEGORIES: Category[] = ["ux", "frontend", "backend"];
const STATUSES: Status[] = ["new", "doing", "done"];

const dbPath = path.join(__dirname, "../data/db.json");

const readDb = (): Db => {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data) as Db;
};

const writeDb = (data: Db): void => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
};

const isCategory = (value: unknown): value is Category =>
  typeof value === "string" && (CATEGORIES as string[]).includes(value);

const isStatus = (value: unknown): value is Status =>
  typeof value === "string" && (STATUSES as string[]).includes(value);

/** ===== TEST ===== */
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend running 🚀");
});

/** ===== MEMBERS ===== */
app.get("/members", (_req: Request, res: Response) => {
  const db = readDb();
  res.json(db.members);
});

app.post("/members", (req: Request, res: Response) => {
  const db = readDb();

  const name = String(req.body?.name ?? "").trim();
  const category = req.body?.category;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }
  if (!isCategory(category)) {
    return res.status(400).json({ message: `category must be one of: ${CATEGORIES.join(", ")}` });
  }

  const newMember: Member = {
    id: Date.now(),
    name,
    category,
  };

  db.members.push(newMember);
  writeDb(db);

  return res.status(201).json(newMember);
});

/** ===== ASSIGNMENTS ===== */
app.get("/assignments", (_req: Request, res: Response) => {
  const db = readDb();
  res.json(db.assignments);
});

app.post("/assignments", (req: Request, res: Response) => {
  const db = readDb();

  const title = String(req.body?.title ?? "").trim();
  const description = String(req.body?.description ?? "").trim();
  const category = req.body?.category;

  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }
  if (!description) {
    return res.status(400).json({ message: "description is required" });
  }
  if (!isCategory(category)) {
    return res.status(400).json({ message: `category must be one of: ${CATEGORIES.join(", ")}` });
  }

  const newAssignment: Assignment = {
    id: Date.now(),
    title,
    description,
    category,
    status: "new",
    assignedTo: null,
    timestamp: new Date().toISOString(),
  };

  db.assignments.push(newAssignment);
  writeDb(db);

  return res.status(201).json(newAssignment);
});

/** ⭐ ASSIGN MEMBER
 * Krav: får endast tilldelas member med samma category.
 * När man assignar ska status bli "doing".
 */
app.patch("/assignments/:id/assign", (req: Request, res: Response) => {
  const db = readDb();
  const assignmentId = Number(req.params.id);

  const assignment = db.assignments.find((a) => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const memberId = Number(req.body?.memberId);
  if (!memberId) {
    return res.status(400).json({ message: "memberId is required" });
  }

  const member = db.members.find((m) => m.id === memberId);
  if (!member) {
    return res.status(404).json({ message: "Member not found" });
  }

  if (member.category !== assignment.category) {
    return res.status(400).json({
      message: "Member category must match assignment category",
      assignmentCategory: assignment.category,
      memberCategory: member.category,
    });
  }

  assignment.assignedTo = member.id;
  assignment.status = "doing";
  writeDb(db);

  return res.json(assignment);
});

/** ⭐ CHANGE STATUS
 * Tillåter bara new/doing/done
 */
app.patch("/assignments/:id/status", (req: Request, res: Response) => {
  const db = readDb();
  const id = Number(req.params.id);

  const assignment = db.assignments.find((a) => a.id === id);
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const status = req.body?.status;
  if (!isStatus(status)) {
    return res.status(400).json({ message: `status must be one of: ${STATUSES.join(", ")}` });
  }

  assignment.status = status;
  writeDb(db);

  return res.json(assignment);
});

/** ⭐ DELETE SPECIFIC ASSIGNMENT
 * Krav: radera i done-kolumnen => vi tillåter delete bara om status är "done".
 */
app.delete("/assignments/:id", (req: Request, res: Response) => {
  const db = readDb();
  const id = Number(req.params.id);

  const index = db.assignments.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const assignment = db.assignments[index];
  if (assignment.status !== "done") {
    return res.status(400).json({ message: "Only assignments with status 'done' can be deleted" });
  }

  const deleted = db.assignments.splice(index, 1)[0];
  writeDb(db);

  return res.json({ message: "Deleted", deleted });
});

/** ⭐ DELETE ALL ASSIGNMENTS (optional)
 * Jag hade personligen tagit bort denna innan inlämning (för säkerhet),
 * men om du vill ha kvar den går det.
 */
app.delete("/assignments", (_req: Request, res: Response) => {
  const db = readDb();
  db.assignments = [];
  writeDb(db);

  return res.json({ message: "All assignments deleted" });
});

/** ===== SERVER ===== */
app.listen(3000, () => {
  console.log("Server running on port 3000");
});