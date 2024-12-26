import { Router } from "express";
import prisma from "../prismaClient.ts";
const router = Router();

// Delete a test user and his todos
router.delete("/__deleteuser__/:username", async (req, res) => {
  try {
    // Get the test user by username
    const user = await prisma.user.findUnique({
      where: {
        username: req.params.username,
      },
    });

    if (!user) {
      res.status(404).json({ message: "Test user not found" });
      return;
    }

    // Delete all todos of the test user first
    // because of the relation - todo is a sub table of user
    await prisma.todo.deleteMany({
      where: {
        userId: user.id,
      },
    });
    // Then delete the test user
    await prisma.user.delete({
      where: {
        username: req.params.username,
      },
    });
    res.status(200).json({ message: "Test user deleted successfully" });
  } catch (error: any) {
    console.log(error?.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/__deleteall__", async (req, res) => {
  try {
    // Удаляет все данные из таблиц "Todo" и "User" и сбрасывает их идентификаторы
    // CASCADE - удаляет все данные из таблиц, на которые есть ссылки
    // RESTART IDENTITY - сбрасывает идентификаторы
    await prisma.$executeRaw`TRUNCATE "Todo", "User" RESTART IDENTITY CASCADE`;

    res.status(200).json({ message: "Database is cleaned up" });
  } catch (error: any) {
    console.log(error?.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
