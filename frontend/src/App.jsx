import { useEffect, useState } from "react";

/* ⭐ Task card */
function TaskCard({ task, reload, members }) {
  const deleteTask = async () => {
    await fetch(`http://localhost:3000/assignments/${task.id}`, {
      method: "DELETE",
    });
    reload();
  };

  const moveTask = async () => {
    const next =
      task.status === "new"
        ? "ongoing"
        : task.status === "ongoing"
        ? "done"
        : "done";

    await fetch(`http://localhost:3000/assignments/${task.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    reload();
  };

  const assign = async (memberId) => {
    await fetch(`http://localhost:3000/assignments/${task.id}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });

    reload();
  };

  const assignedMember = members.find((m) => m.id === task.assignedTo);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 15,
        marginBottom: 15,
        width: 240,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      <h4>{task.title}</h4>
      <p>{task.description}</p>

      <small>Status: {task.status}</small>
      <br />

      <small>
        Assigned: {assignedMember ? assignedMember.name : "None"}
      </small>

      <br />
      <br />

      <select
        value={task.assignedTo || ""}
        onChange={(e) => assign(Number(e.target.value))}
        style={{ width: "100%" }}
      >
        <option value="">Assign member</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <button onClick={moveTask} style={{ marginRight: 10 }}>
        ➡ Move
      </button>

      <button onClick={deleteTask}>❌ Delete</button>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /* ⭐ Load data */
  const loadTasks = () => {
    fetch("http://localhost:3000/assignments")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  };

  const loadMembers = () => {
    fetch("http://localhost:3000/members")
      .then((res) => res.json())
      .then((data) => setMembers(data));
  };

  useEffect(() => {
    loadTasks();
    loadMembers();
  }, []);

  /* ⭐ Create task */
  const createTask = async () => {
    if (!title) return;

    await fetch("http://localhost:3000/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category: "frontend",
      }),
    });

    setTitle("");
    setDescription("");
    loadTasks();
  };

  return (
    <div
      style={{
        padding: 40,
        background: "#f5f6fa",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Scrum board</h1>

      {/* ⭐ Create form */}
      <h2>Skapa task</h2>

      <input
        placeholder="Titel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 8, width: 250 }}
      />

      <br />
      <br />

      <input
        placeholder="Beskrivning"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ padding: 8, width: 250 }}
      />

      <br />
      <br />

      <button onClick={createTask} style={{ padding: "8px 16px" }}>
        Skapa
      </button>

      <hr style={{ margin: "30px 0" }} />

      {/* ⭐ Board */}
      <div style={{ display: "flex", gap: 40 }}>
        <div>
          <h2>New</h2>
          {tasks
            .filter((t) => t.status === "new")
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                reload={loadTasks}
                members={members}
              />
            ))}
        </div>

        <div>
          <h2>Ongoing</h2>
          {tasks
            .filter((t) => t.status === "ongoing")
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                reload={loadTasks}
                members={members}
              />
            ))}
        </div>

        <div>
          <h2>Done</h2>
          {tasks
            .filter((t) => t.status === "done")
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                reload={loadTasks}
                members={members}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;