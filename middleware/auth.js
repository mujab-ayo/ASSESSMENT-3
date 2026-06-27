const jwt = require("jsonwebtoken");

/**
 * Verifies the JWT from the cookie on every protected request.
 * Attaches decoded payload to req.user so routes work the same way.
 * Redirects to /login if the token is missing or invalid.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Mirror the shape req.user had with passport: { id, username }
    req.user = {
      id: decoded.userId,
      username: decoded.username,
    };
    next();
  } catch (err) {
    // Token expired or tampered — clear the stale cookie and redirect
    res.clearCookie("token");
    return res.redirect("/login");
  }
}

module.exports = { requireAuth };
