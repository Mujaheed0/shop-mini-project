const Brand = require("../models/Brand");

const express = require("express");
const router = express.Router();

router.get("/api/brands", async (req, res, next) => {
  const { category_id, product_category_id } = req.query;
  try {
    if (category_id || product_category_id) {
      let response;
      if (product_category_id) {
        response = await Brand.query()
          .whereExists(
            Brand.relatedQuery("products")
              .select("brand_id")

              .where("product_category_id", product_category_id)
          )
          .debug();
      }
      if (category_id) {
        response = await Brand.query()
          .whereExists(
            Brand.relatedQuery("products")
              .select("brand_id")

              .where("category_id", category_id)
          )
          .debug();
      }

      res.send(response);
    } else throw new Error("BadInput");
  } catch (err) {
    // const brandId = query.map((i) => i.brand_id);
    // const brand = await Brand.query().whereIn("id", [brandId]).debug();

    next(err);
  }
});

router.get("/api/allbrands", async (req, res, next) => {
  try {
    const query = Brand.query().select(["id as value", "name as label"]);
    let response = await query;
    res.send(response);
  } catch (err) {
    // const brandId = query.map((i) => i.brand_id);
    // const brand = await Brand.query().whereIn("id", [brandId]).debug();

    next(err);
  }
});

module.exports = router;
