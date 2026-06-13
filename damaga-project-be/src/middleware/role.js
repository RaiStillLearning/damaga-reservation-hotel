function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: insufficient permission" });
    }
    next();
  };
}

module.exports = { requireRole };
