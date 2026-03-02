import jwt from "jsonwebtoken";

/* ---------- USER AUTH ---------- */
export const userAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ---------- ADMIN AUTH ---------- */
export const authAdmin = (req, res, next) => {
  // First check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Then check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  next();
};