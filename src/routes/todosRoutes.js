import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const getTodos = db.prepare("SELECT * FROM todos WHERE user_id = ?");
  const todos = getTodos.all(req.userId);

  res.status(200).json(todos);
});

router.post("/", (req, res) => {
  const userId = req.userId;
  const task = req.body.task;

  try {
    const postTodo = db.prepare(
      "INSERT INTO todos (user_id, task) VALUES (?, ?)"
    );
    postTodo.run(userId, task);
    res.sendStatus(201);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

router.put("/:todoId", (req, res) => {
  const todoId = req.params.todoId;
  const { completed } = req.body;

  try {
    const updateTodo = db.prepare(
      "UPDATE todos SET completed = ? WHERE id = ?"
    );
    updateTodo.run(completed, todoId);
    res.sendStatus(201);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

router.delete("/:todoId", (req, res) => {
  const todoId = req.params.todoId;
  const userId = req.userId;
  try {
    // Проверяем id тудушки вместе с id пользователя, чтобы не удалить из базы туду с таким же id другого пользователя
    const deleteTodo = db.prepare(
      "DELETE FROM todos WHERE id = ? AND user_id = ?"
    );
    deleteTodo.run(todoId, userId);
    res.sendStatus(200);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

export default router;
