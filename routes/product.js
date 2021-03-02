const express = require("express");
const Category = require("../models/Category");
const Product = require("../models/Product");
const { Joi, validate } = require("express-validation");
const {
  ValidationError,
  ConstraintViolationError,
  DBError,
} = require("objection");
const Skus = require("../models/Skus");
const { raw } = require("objection");
const e = require("express");
const { adminMiddleware } = require("../middlewares/middleware");
const ProductImage = require("../models/Image");
const router = express.Router();

router.post("/api/validate_cart", async (req, res, next) => {
  const { cart } = req.body;
  console.log(req.body);
  let sku_ids = [];
  try {
    cart.map((i) => sku_ids.push(i.sku_id));
    const query = Skus.query().whereIn("id", sku_ids).debug();

    let response = await query;
    console.log(response);
    for (let i = 0; i < cart.length; i++) {
      for (let j = 0; j < response.length; j++) {
        if (cart[i].sku_id === response[j].id) {
          if (cart[i].quantity > response[j].stock) {
            response[j].quantity = response[j].stock;
            response[j].message = "Updated Quantity";
            response[j].sku_id = cart[i].sku_id;
            response[j].name = cart[i].name;
            response[j].image_url = cart[i].image_url;
            response[j].id = cart[i].id;
          } else {
            response[j].quantity = cart[i].quantity;
            response[j].sku_id = cart[i].sku_id;
            response[j].name = cart[i].name;
            response[j].image_url = cart[i].image_url;
            response[j].id = cart[i].id;
          }
        }
      }
    }
    let updatedCart = response.filter((i) => i.stock > 0);

    res.send(updatedCart);
  } catch (e) {
    next(e);
  }
});

router.get("/api/product_suggestions", async (req, res, next) => {
  const { q, page = 0 } = req.query;

  // const query =
  //   'select  * from "product" inner join  (select distinct product_id from tag  where  similarity(tag,?)>0   )v    on v.product_id=product.id  where  similarity(name,?)>0  order by similarity(name,?) desc   ';
  // const rawQuery =
  //   'select   "product".* from "product"  inner join  (select distinct product_id from tag  where  similarity(tag,?)>0 )v    on v.product_id=product.id  order by similarity(name,?) desc limit 2  ';

  // knex
  //   .raw(query, [req.query.q, req.query.q, req.query.q])
  //   .then((result) => console.table(result.rows));
  // .knex("product_types")
  // .where("product_types.product_id", "product.id")
  // .select();
  try {
    const query = Product.query();
    query
      .withGraphFetched("[skus,skus.images]")

      .whereRaw("similarity(name,?)>0", [q])
      .orderByRaw("similarity(name,?) desc", [q])
      .offset(page * 5)
      .limit(5);

    query.debug();

    const response = await query;
    console.table(response);
    res.send(response);
  } catch (err) {
    next(err);
  }
});

router.get("/api/product/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await Product.query()
      .withGraphFetched("[brand,skus,skus.images]")
      .where("product.id", id)
      .returning("*")
      .debug();
    console.log(response);
    res.send(response);
  } catch (err) {
    next(err);
  }
});

// const postProduct = {
//   body: Joi.object({
//     product: Joi.object({
//       name: Joi.string().required(),
//       desc: Joi.string().required(),

//       category_id: Joi.number(),
//       product_category_id: Joi.number(),
//       brand_id: Joi.any().allow(),
//       brand: Joi.any({
//         name: Joi.string().allow(),
//       }).allow(),
//       show: Joi.any().allow(),
//     }),
//   }),
// };

const pactchProduct = {
  body: Joi.object({
    product: Joi.object({
      id: Joi.number().required(),
      name: Joi.string().required(),
      desc: Joi.string().required(),
      category_id: Joi.number(),
      product_category_id: Joi.number(),
      brand_id: Joi.any(),
      brand: Joi.object({
        name: Joi.any(),
      }),
      tags: Joi.array().items(Joi.object({ tag: Joi.any(), id: Joi.number() })),
    }),
  }),
};

router.patch(
  "/api/product/:id",
  validate(pactchProduct, {}, {}),
  async (req, res, next) => {
    const { id } = req.params;
    const { product } = req.body;
    const options = {
      unrelate: ["brand"],
      relate: ["brand"],
      noDelete: ["brand"],
    };
    try {
      const insertedGraph = await Product.transaction(async (trx) => {
        const insertedGraph = await Product.query(trx)
          .upsertGraph(product, options)

          .debug()
          .returning("*");
        // const query = await Product.query().upsertGraph(product).returning("*");
        return insertedGraph;
        // res.send(query);
      });
      res.send(insertedGraph);
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      if (err instanceof ValidationError) {
        return res.status(err.statusCode).json(err.details);
      }
      if (err instanceof ConstraintViolationError) {
        err.details = "Product already exists";
      } else if (err instanceof DBError) {
        err.details = "Database error";
      }
      next(err);
    }
  }
);

router.post(
  "/api/product",

  async (req, res, next) => {
    const { product } = req.body;
    try {
      const response = await Product.transaction(async (trx) => {
        const insertedGraph = await Product.query(trx)
          // For security reasons, limit the relations that can be inserted.
          .allowGraph("[brand,skus,category,product_category]")
          .insertGraph(product)
          .debug()
          .returning("*");

        return insertedGraph;
      });
      res.send(response);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(err.statusCode).json(err.details);
      }
      if (err instanceof ConstraintViolationError) {
        err.details = err.nativeError.detail;
      } else if (err instanceof DBError) {
        err.details = "Database error";
      }
      next(err);
    }
  }
);
const postSku = {
  body: Joi.object({
    sku: Joi.object({
      product_id: Joi.number().required(),
      discount: Joi.number().allow(),
      stock: Joi.number().required(),
      sku: Joi.string().required(),
      mrp: Joi.number(),
      sp: Joi.number().required(),
      isDefault: Joi.allow(),
      images: Joi.array(),
    }),
  }),
};

router.patch("/api/setImage", adminMiddleware, async (req, res, next) => {
  const { sku } = req.body;
  const query = ProductImage.query().insert({
    sku_id: sku.id,
    image: sku.image,
  });
  await query;
  query.debug();
  const sendsku = Skus.query().findById(sku.id).withGraphFetched("[images]");

  const response = await sendsku;
  res.send(response);
});
router.post("/api/sku", validate(postSku, {}, {}), async (req, res, next) => {
  const { sku } = req.body;
  console.log(sku);
  try {
    const response = await Skus.transaction(async (trx) => {
      const insertedGraph = await Skus.query(trx).insertGraph(sku).debug();

      return insertedGraph;
    });
    res.send(response);
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
    if (err instanceof ValidationError) {
      console.log(err);
      res.status(err.statusCode);
    }
    if (err instanceof ConstraintViolationError) {
      err.details = "Product already exists";
    } else if (err instanceof DBError) {
      err.details = "Database error";
    }
    next(err);
  }
});

router.patch("/api/sku", async (req, res, next) => {
  const { sku } = req.body;
  try {
    const insertedGraph = await Skus.transaction(async (trx) => {
      const insertedGraph = await Skus.query(trx)
        .where("id", sku.id)
        .patch({
          discount: sku.discount,
          mrp: sku.mrp,
          sp: sku.sp,
          stock: +sku.stock,
          sku: sku.sku,
        })
        .returning("*")
        .debug();
      console.log(insertedGraph);

      return insertedGraph;
    });
    res.send(insertedGraph);
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(err.details);
    }
    if (err instanceof ConstraintViolationError) {
      err.details = "Product already exists";
    } else if (err instanceof DBError) {
      err.details = "Database error";
    }
    next(err);
  }
});

const sorting = (sort_type) => {
  if (sort_type === "popularity") {
    return {
      modifiers: "sold",
      col: "max(skus.sold)",
      order: "desc",
    };
  } else if (sort_type === "low-to-high") {
    return {
      modifiers: "min_sp",
      col: "min(skus.sp)",
      order: "asc",
    };
  } else if (sort_type === "high-to-low") {
    return {
      modifiers: "max_sp",
      col: "max(skus.sp)",
      order: "desc",
    };
  } else if (sort_type === "new-first") {
    return {
      modifiers: "created_at",
      col: "product.created_at",
      order: "desc",
    };
  } else if (sort_type === "discount") {
    return {
      modifiers: "discount",
      col: "min(skus.discount)",
      order: "desc",
    };
  }
};

router.get("/api/products", async (req, res, next) => {
  const { category_id, product_category_id, page = 0, sort } = req.query;

  try {
    if (category_id || product_category_id) {
      let query;
      if (product_category_id) {
        if (isNaN(product_category_id) || isNaN(page)) {
          throw new Error("BadInput");
        } else {
          query = Category.relatedQuery("products")
            .for([product_category_id])
            .select(["product.id", "product.name", "product.desc"])
            .innerJoinRelated("skus")
            .groupBy("product.id");
        }
      } else if (category_id) {
        if (isNaN(category_id) || isNaN(page)) throw new Error("BadInput");
        else {
          query = Category.relatedQuery("all_products")
            .for(category_id)
            .select(["product.id", "product.name", "product.desc"])
            .innerJoinRelated("skus")
            .groupBy("product.id");
        }
      }
      let sortType;
      if (sort) {
        sortType = sorting(sort);
        query.orderByRaw(`${sortType.col} ${sortType.order}`);
      } else {
        sortType = {
          modifiers: "sold",
          col: "min(skus.sold)",
          order: "desc",
        };
        query.orderByRaw(`${sortType.col} ${sortType.order}`);
      }
      query
        .withGraphFetched(`[skus(${sortType.modifiers}).images]`)
        .page(page, 10);
      query.debug();

      if (req.query.brand) {
        let brand = req.query.brand.map((i) => +i);
        query.whereIn("brand_id", brand);
      }

      query.debug();
      const response = await query;
      res.send(response);
    } else throw new Error("BadInput");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
