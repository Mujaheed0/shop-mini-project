const Product = require("../models/Product");

const express = require("express");

const router = express.Router();

router.get("/api/tags", async (req, res, next) => {
  console.log(req.query.q);
  const knex = Product.knex();
  const rawQuery =
    "SELECT *, similarity(product.name, ?) AS sml FROM product WHERE  similarity(product.name, ?) > 0 ORDER BY similarity(product.name, ?)  DESC LIMIT 5;";

  const response = await knex.raw(rawQuery, [
    req.query.q,
    req.query.q,
    req.query.q,
  ]);
  console.table(response.rows);
  res.send(response.rows);
});

module.exports = router;
