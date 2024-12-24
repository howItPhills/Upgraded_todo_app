import express from "express";
import prismaDb from "../prismaClient.ts";
import type { Response } from "express";
import type {
  AuthedRequest,
  DeleteTaskRequest,
  PutToTaskRequest,
  PostTaskRequest,
} from "./types.ts";

const router = express.Router();

router.get("/", async (req: AuthedRequest, res: Response) => {
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

router.post("/", async (req: PostTaskRequest, res: Response) => {
  const { task, userId } = req.body;

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
});

router.put("/:todoId", async (req: PutToTaskRequest, res: Response) => {
  const { todoId } = req.params;
  const { completed, userId } = req.body;
  // Обязательно проверить и айди пользователя, чтобы не удалить туду с таким же айди другого пользователя
  try {
    const updated = await prismaDb.todo.update({
      where: {
        // В params todoId - строка, а в базе данных - число
        id: parseInt(todoId),
        userId,
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
});

router.delete("/:todoId", async (req: DeleteTaskRequest, res: Response) => {
  const { todoId } = req.params;
  const { userId } = req.body;

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
});

export default router;
