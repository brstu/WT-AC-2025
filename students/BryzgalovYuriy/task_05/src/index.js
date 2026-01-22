import express from "express";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import swaggerUi from "swagger-ui-express";

const app = express();
const PORT = 3000;

// ===== middleware =====
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ===== data =====
const DATA_FILE = "./data.json";

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ===== swagger =====
const swaggerDoc = JSON.parse(fs.readFileSync("./swagger.json"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ===== validation =====
function validateTask(body) {
  if (!body.title || body.title.length < 1 || body.title.length > 100) {
    return "title must be 1..100 chars";
  }
  if (typeof body.done !== "boolean") {
    return "done must be boolean";
  }
  if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
    return "dueDate must be ISO date";
  }
  return null;
}

// ===== routes =====

// GET list
app.get("/tasks", (req, res) => {
  const data = readData();
  res.json(data.items);
});

// GET by id
app.get("/tasks/:id", (req, res) => {
  const data = readData();
  const item = data.items.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// POST create
app.post("/tasks", (req, res) => {
  const error = validateTask(req.body);
  if (error) return res.status(422).json({ error });

  const data = readData();
  const newItem = {
    id: Date.now(),
    ...req.body
  };

  data.items.push(newItem);
  writeData(data);

  res.status(201).json(newItem);
});

// DELETE
app.delete("/tasks/:id", (req, res) => {
  const data = readData();
  const idx = data.items.findIndex(i => i.id === Number(req.params.id));

  if (idx === -1) return res.status(404).json({ error: "Not found" });

  data.items.splice(idx, 1);
  writeData(data);

  res.status(204).send();
});

// ===== errors =====
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ===== start =====
app.listen(PORT, () => {
  console.log(`API running: http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/docs`);
});
