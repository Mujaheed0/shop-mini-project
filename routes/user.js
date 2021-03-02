const express = require("express");
const router = express.Router();

const { adminMiddleware } = require("../middlewares/middleware");
const User = require("../models/User");
router.get("/api/users", adminMiddleware, async (req, res, next) => {
  try {
    const users = User.query().whereExists(
      User.relatedQuery("roles").where("role", "customer")
    );

    users.debug();

    const response = await users;

    res.send(response);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
