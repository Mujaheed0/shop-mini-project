const express = require("express");
const Role = require("../models/Role");
const User = require("../models/User");
const router = express.Router();
const {
  adminMiddleware,
  userMiddleware,
} = require("../middlewares/middleware");

router.delete("/api/role", async (req, res, next) => {
  const { user } = req.session;
  try {
    const role = await Role.query().where("role", "admin");
    const query = User.relatedQuery("roles")
      .for(user)
      .unrelate()
      .where("role", "like", "admin");
    const response = await query;
    res.status(202).send("Operation successfull");
  } catch (err) {
    next(err);
  }
});
router.post(
  "/api/role",
  userMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    const { userId } = req.body;
    try {
      const user = await User.query().findById(userId);
      if (!user) {
        res.status(404);
        throw new Error("BadInput");
      } else {
        const role = await Role.query().where("role", "admin");
        const query = User.relatedQuery("roles").for(user).relate(role);
        query.debug();
        const response = await query;

        res.send({ message: "Operation successful" });
      }
    } catch (err) {
      if ((err.code = "23505")) {
        res.status(409);
        err.message = "Role already exists";
      } else {
        res.status(500);
      }
      next(err);
    }
  }
);
module.exports = router;
