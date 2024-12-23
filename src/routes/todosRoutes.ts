import express from "express";
import prismaDb from "../prismaClient.ts";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const todos = await prismaDb.todo.findMany({
      where: {
        userId: req.body.userId,
      },
    });
    res.status(200).json(todos);
  } catch (error: any) {
    console.log(error?.message);
    res.sendStatus(500);
  }
});

router.post(
  "/",
  async (
    req: Request<{}, {}, { task: string; userId: number }>,
    res: Response
  ) => {
    const userId = req.body.userId;
    const task = req.body.task;

    try {
      const newTask = await prismaDb.todo.create({
        data: {
          task,
          userId,
        },
      });
      res.status(201).json(newTask);
    } catch (error: any) {
      console.log(error?.message);
      res.sendStatus(500);
    }
  }
);

router.put(
  "/:todoId",
  async (
    req: Request<
      { todoId: string },
      {},
      { userId: number; completed: boolean }
    >,
    res: Response
  ) => {
    const todoId = req.params.todoId;
    const { completed } = req.body;
    // Обязательно проверить и айди пользователя, чтобы не удалить туду с таким же айди другого пользователя
    try {
      const updated = await prismaDb.todo.update({
        where: {
          // В params todoId - строка, а в базе данных - число
          id: parseInt(todoId),
          userId: req.body.userId,
        },
        data: {
          completed: !!completed,
        },
      });
      res.status(201).json(updated);
    } catch (error: any) {
      console.log(error?.message);
      res.sendStatus(500);
    }
  }
);

router.delete(
  "/:todoId",
  async (
    req: Request<{ todoId: string }, {}, { userId: number }>,
    res: Response
  ) => {
    const todoId = req.params.todoId;
    const userId = req.body.userId;

    try {
      // Проверяем id тудушки вместе с id пользователя, чтобы не удалить из базы туду с таким же id другого пользователя
      await prismaDb.todo.delete({
        where: {
          id: parseInt(todoId),
          userId,
        },
      });
      res.sendStatus(200);
    } catch (error: any) {
      console.log(error?.message);
      res.sendStatus(500);
    }
  }
);

export default router;
