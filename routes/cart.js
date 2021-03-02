const express = require("express");
const Knex = require("knex");
const knexConfig = require("../knexfile");
const knex = Knex(knexConfig.development);
const { raw, Model } = require("objection");
const Cart = require("../models/Cart");
const CartItems = require("../models/CartItems");

const Skus = require("../models/Skus");
const ResultsDummy = require("../models/Results_dummy");
const { userMiddleware } = require("../middlewares/middleware");
const router = express.Router();

router.post("/api/add-to-cart", userMiddleware, async (req, res, next) => {
  req.body.cart_id = req.session.cartId;
  console.log(req.session.cartId);
  try {
    const insertQuery = await CartItems.transaction(async (trx) => {
      const itemPresent = await CartItems.query()
        .where("sku_id", "=", req.body.sku_id)
        .andWhere("cart_id", "=", req.session.cartId);
      console.log(itemPresent);
      if (itemPresent.length === 0) {
        const query = await Skus.query(trx)
          .decrement("stock", 1)
          .where("id", "=", req.body.sku_id);
        const cartQuery = await CartItems.query(trx)
          .insertGraph(req.body)
          .debug()
          .returning("*");
        return cartQuery;
      } else throw new Error("InvalidData");
    });
    res.send(insertQuery);
  } catch (err) {
    next(err);
  }
});

router.post("/api/increment-cart", userMiddleware, async (req, res, next) => {
  try {
    const insertQuery = await CartItems.transaction(async (trx) => {
      const itemPresent = await CartItems.query()
        .where("sku_id", "=", req.body.sku_id)
        .andWhere("cart_id", "=", req.session.cartId);
      console.log(itemPresent);
      if (itemPresent.length > 0) {
        const query = await Skus.query(trx)
          .decrement("stock", 1)
          .where("id", "=", req.body.sku_id);
        const cartQuery = await CartItems.query(trx)
          .increment("quantity", 1)
          .where("sku_id", "=", req.body.sku_id)
          .andWhere("cart_id", "=", req.session.cartId)
          .debug()
          .returning("*");
        return cartQuery;
      } else throw new Error("InvalidData");
    });
    res.send(insertQuery);
  } catch (err) {
    next(err);
  }
});

router.post("/api/decrement-cart", userMiddleware, async (req, res, next) => {
  try {
    const insertQuery = await CartItems.transaction(async (trx) => {
      const itemPresent = await CartItems.query()
        .where("sku_id", "=", req.body.sku_id)
        .andWhere("cart_id", "=", req.session.cartId);
      console.log(itemPresent);
      if (itemPresent.length > 0) {
        if (itemPresent[0].quantity === 1) {
          const query = await Skus.query(trx)
            .increment("stock", 1)
            .where("id", "=", req.body.sku_id);
          const cartQuery = await CartItems.query(trx)
            .delete()
            .where("sku_id", "=", req.body.sku_id)
            .debug()
            .returning("*");
          return cartQuery;
        } else {
          const query = await Skus.query(trx)
            .increment("stock", 1)
            .where("id", "=", req.body.sku_id);
          const cartQuery = await CartItems.query(trx)
            .decrement("quantity", 1)
            .where("sku_id", "=", req.body.sku_id)
            .andWhere("cart_id", "=", req.session.cartId)
            .debug()
            .returning("*");

          return cartQuery;
        }
      } else throw new Error("InvalidData");
    });
    res.send(insertQuery);
  } catch (err) {
    next(err);
  }
});
router.get("/api/cart", userMiddleware, async (req, res, next) => {
  console.log(req.session.cartId);
  try {
    const query = CartItems.query()
      .where("cart_id", "=", req.session.cartId)
      .withGraphFetched("[productId,skuId,skuId.images]")
      .debug();
    const response = await query;
    res.send(response);
  } catch (err) {
    next(err);
  }
});
router.get("/api/initCart", userMiddleware, async (req, res, next) => {
  console.log(req.session.cartId);
  try {
    const query = CartItems.query().where("cart_id", "=", req.session.cartId);

    const response = await query;
    res.send(response);
  } catch (err) {
    next(err);
  }
});

// router.get("/api/update", async (req, res, next) => {
//   let date = new Date();
//   date.setHours(date.getHours() - 0);
//   date = date.toLocaleString();
//   // try {
//   //   const query = CartItems.query().where(
//   //     "created_at",
//   //     "<",
//   //     date.toLocaleString()
//   //   );

//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     const queryText = ` update skus as sku set stock=new.quantity+sku.stock, updated_at=now() from ( select sum(quantity) as quantity,sku_id  from cart_items where created_at<'${date}'  GROUP BY  sku_id) as new where sku.id=new.sku_id;  delete  from cart_items where created_at < '${date}'`;
//     const queryR = await client.query(queryText);
//     let response = await client.query("COMMIT");
//     console.log(queryR);
//     res.send("done");
//   } catch (e) {
//     console.log(e);
//     await client.query("ROLLBACK");
//     next(e);
//   }

//   // const update = Skus.query()
//   //   .patch({ stock: 20 })
//   //   .where("id", "=", "534723")
//   //   .debug();

//   // const up = Skus.query()
//   //   .patch({ stock: 20 })
//   //   .where("id", "=", "534723")
//   //   .debug();
//   // let queries = [update, up];
//   // queries.join(";");
//   // const r = await update;
//   // res.send({ r });
//   // const subQuery = ResultsDummy.query()

//   //   .select(raw("id,sum(quantity) as quantity"))

//   //   .groupBy("results_dummy.id");
//   // const sku = Skus.query()
//   //   .patch({ stock: raw("sku.stock+rd.stock") })
//   //   .from(subQuery);
//   // let response = await sku;
//   // res.send(response);
//   // const insertQuery = await CartItems.transaction(async (trx) => {
//   //   const query = await Skus.query(trx)
//   //     .decrement("stock", 1)
//   //     .where("id", "=", req.body.sku_id);
//   //   const cartQuery = await CartItems.query(trx)
//   //     .insertGraph(req.body)
//   //     .debug()
//   //     .returning("*");
//   //   return cartQuery;
//   // });
//   // res.send(insertQuery);

//   // const update = Skus.knex();
//   // let q = ` begin; update skus as sku set stock=new.quantity+sku.stock, updated_at=now() from ( select sum(quantity) as quantity,sku_id  from cart_items where created_at<'${date.toLocaleString()}'  GROUP BY  sku_id) as new where sku.id=new.sku_id;  delete  from cart_items where created_at < '${date.toLocaleString()}' ; commit`;
//   // const response = await update.raw(q);
//   // res.send(response.rows);
//   // let response;
//   // const subquery = knex("results_dummy")
//   //   .select("id", knex.raw("sum(quantity) as quantity"))
//   //   .groupBy("id");

//   // knex("skus")
//   //   .transaction(trx)
//   //   .increment("stock", "rd.quantity")
//   //   .from(function () {
//   //     this.sum("quantity as quantity")
//   //       .select("id")
//   //       .from("results_dummy")
//   //       .groupBy("id")
//   //       .as("rd");
//   //   })
//   //   .where("skus.id", "=", "rd.id")
//   //   .then(function (resp) {
//   //     const id = resp.rows;
//   //     console.log(id);
//   //   });
//   // } catch (err) {
//   //   next(err);
// });
module.exports = router;
