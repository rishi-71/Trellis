const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey12345");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token." });
  }
};

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Requires one of these roles: ${allowedRoles.join(", ")}` 
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  verifyRole,
  verifyStudent: verifyRole(["student"]),
  verifyFaculty: verifyRole(["faculty"]),
  verifyAdmin: verifyRole(["admin"]),
  verifyFacultyOrAdmin: verifyRole(["faculty", "admin"])
};
