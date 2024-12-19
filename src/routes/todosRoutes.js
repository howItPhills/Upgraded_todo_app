import express from "express";
import prismaDb from "../prismaClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const todos = await prismaDb.todo.findMany({
      where: {
        userId: req.userId,
      },
    });
    res.status(200).json(todos);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  const userId = req.userId;
  const task = req.body.task;

  try {
    const newTask = await prismaDb.todo.create({
      data: {
        task,
        userId,
      },
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

router.put("/:todoId", async (req, res) => {
  const todoId = req.params.todoId;
  const { completed } = req.body;
  // Обязательно проверить и айди пользователя, чтобы не удалить туду с таким же айди другого пользователя
  try {
    const updated = await prismaDb.todo.update({
      where: {
        id: todoId,
        userId: req.userId,
      },
      data: {
        completed,
      },
    });
    res.status(201).json(updated);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

router.delete("/:todoId", async (req, res) => {
  const todoId = req.params.todoId;
  const userId = req.userId;

  try {
    // Проверяем id тудушки вместе с id пользователя, чтобы не удалить из базы туду с таким же id другого пользователя
    await prismaDb.todo.delete({
      where: {
        id: todoId,
        userId,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

export default router;
