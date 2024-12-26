import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";
import type { Response } from "express";
import prismaDb from "../prismaClient.ts";
import type { LoginRequest, RegisterRequest } from "./types.ts";

// Расширяем тип JwtPayload для включения id, которым пользуемся в методе sign
// при создании токена, чтобы потом извлекать его из токена в authMiddleware(метод verify)
declare module "jsonwebtoken" {
  interface JwtPayload {
    id: number;
  }
}

const router = express.Router();

router.post("/login", async (req: LoginRequest, res: Response) => {
  try {
    const user = await prismaDb.user.findUnique({
      where: {
        username: req.body.username,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    //Compares the password from request and db user password (hashed/encoded string)
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({ message: "Password is invalid" });
      return;
    }
    // If everything is ok - send back a token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as Secret, {
      expiresIn: "24h",
    });
    res.status(200).json({ token });
  } catch (error: any) {
    console.log(error?.message);
    res.sendStatus(500);
  }
});

router.post("/register", async (req: RegisterRequest, res: Response) => {
  const body = req.body;

  //Encrypting the password, can't be decrypted
  const hashedPassword = bcrypt.hashSync(body.password, 8);

  try {
    const existingUser = await prismaDb.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (existingUser) {
      res.status(401).json({ message: "User already exists" });
      return;
    }

    // Create a new user
    const user = await prismaDb.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
      },
    });

    // Create a default task for the new user
    const defaultTask = "Hi, let's add your first todo";

    await prismaDb.todo.create({
      data: {
        task: defaultTask,
        userId: user.id,
      },
    });

    // Create a token for the new user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as Secret, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error: any) {
    console.log(error?.message);
    res.sendStatus(500);
  }
});

export default router;
