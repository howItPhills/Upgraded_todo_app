import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err.message);
      res.status(401).json({ message: "Token is invalid" });
      return;
    }

    req.userId = decoded.id;

    next();
  });
}

export default authMiddleware;
