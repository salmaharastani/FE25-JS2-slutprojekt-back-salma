"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
/** ===== Helpers ===== */
const CATEGORIES = ["ux", "frontend", "backend"];
const STATUSES = ["new", "doing", "done"];
const dbPath = path_1.default.join(__dirname, "../data/db.json");
const readDb = () => {
    const data = fs_1.default.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
};
const writeDb = (data) => {
    fs_1.default.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
};
const isCategory = (value) => typeof value === "string" && CATEGORIES.includes(value);
const isStatus = (value) => typeof value === "string" && STATUSES.includes(value);
/** ===== TEST ===== */
app.get("/", (_req, res) => {
    res.send("Backend running 🚀");
});
/** ===== MEMBERS ===== */
app.get("/members", (_req, res) => {
    const db = readDb();
    return res.json(db.members);
});
app.post("/members", (req, res) => {
    const db = readDb();
    const name = String(req.body?.name ?? "").trim();
    const category = req.body?.category;
    if (!name) {
        return res.status(400).json({ message: "name is required" });
    }
    if (!isCategory(category)) {
        return res
            .status(400)
            .json({ message: `category must be one of: ${CATEGORIES.join(", ")}` });
    }
    const newMember = {
        id: Date.now(),
        name,
        category,
    };
    db.members.push(newMember);
    writeDb(db);
    return res.status(201).json(newMember);
});
/** ===== ASSIGNMENTS ===== */
app.get("/assignments", (_req, res) => {
    const db = readDb();
    return res.json(db.assignments);
});
app.post("/assignments", (req, res) => {
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
        return res
            .status(400)
            .json({ message: `category must be one of: ${CATEGORIES.join(", ")}` });
    }
    const newAssignment = {
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
/** ===== ASSIGN MEMBER =====
 * Endast member med samma category får väljas.
 * Tasken stannar kvar i "new" tills användaren klickar Move.
 */
app.patch("/assignments/:id/assign", (req, res) => {
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
/** ===== CHANGE STATUS =====
 * Tillåter bara new/doing/done
 */
app.patch("/assignments/:id/status", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const assignment = db.assignments.find((a) => a.id === id);
    if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
    }
    const status = req.body?.status;
    if (!isStatus(status)) {
        return res
            .status(400)
            .json({ message: `status must be one of: ${STATUSES.join(", ")}` });
    }
    assignment.status = status;
    writeDb(db);
    return res.json(assignment);
});
/** ===== DELETE ASSIGNMENT =====
 * Bara tasks med status "done" får raderas
 */
app.delete("/assignments/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const index = db.assignments.findIndex((a) => a.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Assignment not found" });
    }
    const assignment = db.assignments[index];
    if (assignment.status !== "done") {
        return res
            .status(400)
            .json({ message: "Only assignments with status 'done' can be deleted" });
    }
    const deleted = db.assignments.splice(index, 1)[0];
    writeDb(db);
    return res.json({ message: "Deleted", deleted });
});
/** ===== SERVER ===== */
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
