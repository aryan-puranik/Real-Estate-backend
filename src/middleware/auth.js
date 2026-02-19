import jwt from "jsonwebtoken";

/* ---------- USER AUTH ---------- */
export const userAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ---------- ADMIN AUTH ---------- */
export const authAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No admin token" });

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.admin = decoded; // { id, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid admin token" });
  }
};
