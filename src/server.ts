import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/authRoutes.ts";
import authMiddleware from "./middleware/authMiddleware.ts";
import todosRouter from "./routes/todosRoutes.ts";
import testsRouter from "./routes/testsRoutes.ts";

const app = express();
const PORT = process.env.PORT || 9000;

// Path of the current file (D:\code\back\fullstackTodoApp\src\server.js)
const __fileName = fileURLToPath(import.meta.url);

// Path of the folder for the current file (D:\code\back\fullstackTodoApp\src)
const __dirname = dirname(__fileName);

// Middlewares
app.use(express.json());

app.use("/auth", authRouter);
app.use("/todos", authMiddleware, todosRouter); //Protected routes
app.use("/__tests__", testsRouter);

// Makes directory path to be outside of src folder
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  // Sending html homepage
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`listening port: ${PORT}`));
