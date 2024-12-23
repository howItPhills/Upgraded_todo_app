import jwt from "jsonwebtoken";
import type { JwtPayload, Secret } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as Secret,
    (err, decoded: string | JwtPayload | undefined) => {
      if (err || !decoded || typeof decoded === "string") {
        console.log(err?.message);
        res.status(401).json({ message: "Token is invalid" });
        return;
      }

      req.body.userId = decoded.id;

      next();
    }
  );
};

export default authMiddleware;
