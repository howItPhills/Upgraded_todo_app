import express from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Preparing a sql command (? - is for placeholding)
  const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`);
  // This script will inject username to previous script (instead of ?) and get target user
  const user = getUser.get(username);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  //Compares the password from request and db user password (hashed/encoded string)
  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: "Password is invalid" });
    return;
  }
  console.log(user);

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  res.json({ token });
});

router.post("/register", (req, res) => {
  const body = req.body;

  //Encrypting the password, can't be decrypted
  const hashedPassword = bcrypt.hashSync(body.password, 8);

  try {
    const insertToUsers = db.prepare(`
      INSERT INTO users (username, password)
      VALUES (?, ?)
      `);

    const resultUsers = insertToUsers.run(body.username, hashedPassword);

    const defaultTask = "Hi, let's add your first todo";
    const insertToTodos = db.prepare(`
      INSERT INTO todos (user_id, task)
      VALUES (?, ?)
      `);

    insertToTodos.run(resultUsers.lastInsertRowid, defaultTask);

    const token = jwt.sign(
      { id: resultUsers.lastInsertRowid },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    console.log(error.message);
    res.sendStatus(503);
  }
});

export default router;
