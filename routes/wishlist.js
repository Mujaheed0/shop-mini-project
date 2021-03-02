const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const WishlistItems = require("../models/WishlistItems");
const router = express.Router();

router.get("/api/wishlist", userMiddleware, async (req, res, next) => {
  try {
    const query = WishlistItems.query()
      .withGraphFetched("[productId,skuId.images]")
      .where("wishlist_id", +req.session.cartId);
    const response = await query;

    res.send(response);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
