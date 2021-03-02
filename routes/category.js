const express = require("express");
const { errorMessages } = require("../middlewares/middleware");
const Category = require("../models/Category");
const ProductCategory = require("../models/productCategory");
const router = express.Router();

router.post("/api/category", async (req, res, next) => {
  const { category } = req.body;

  console.log(req.body);
  try {
    const insertedGraph = await Category.transaction(async (trx) => {
      const insertedGraph = await Category.query(trx).insert(category).debug();
      return insertedGraph;
    });
    res.send(insertedGraph);
  } catch (err) {
    next(err);
  }
});
router.get("/api/category", async (req, res, next) => {
  try {
    const query = Category.query();
    if (req.query.select) {
      query.select(req.query.select);
    }
    query
      .withGraphJoined("[subCat]")
      .orderBy("product_category.created_at", "desc")
      .whereNull("product_category.category_id")
      .select([
        "product_category.slug",
        "product_category.image_url",
        "product_category.id",
        "product_category.name",
      ]);

    const response = await query;

    res.send(response);
  } catch (err) {
    next(err);
  }
});
router.post("/api/product_category", async (req, res, next) => {
  const { category } = req.body;

  try {
    if (!req.body.category.category_id) {
      throw new Error(ValidationError);
    }
    const insertedGraph = await Category.transaction(async (trx) => {
      const insertedGraph = await Category.query(trx).insert(category).debug();
      return insertedGraph;
    });
    res.send(insertedGraph);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
