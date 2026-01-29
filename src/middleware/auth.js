const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.header("x-auth-token");

  // Optional: allow Bearer token
  if (!token && req.header("authorization")) {
    const authHeader = req.header("authorization");
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // { id: userId }
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
