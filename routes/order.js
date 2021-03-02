const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ProductType = require("../models/Skus");
const OrderItems = require("../models/order_items");
const { userMiddleware } = require("../middlewares/middleware");
const CartItems = require("../models/CartItems");
const Skus = require("../models/Skus");
const { Pool } = require("pg");
const router = express.Router();

const pool = new Pool({
  connectionString: "",
  // connect to postgres db
});
router.post("/api/order", userMiddleware, async (req, res, next) => {
  const order = req.body;

  order.order_status = "PENDING";
  const client = await pool.connect();
  try {
    const cart_items = await CartItems.query()
      .where("cart_id", "=", req.session.cartId)
      .select("sku_id");
    let array = [];
    cart_items.map((i) => array.push(i.sku_id));

    const skus = await Skus.query().whereIn("id", array);
    let total = 0;
    skus.map((i) => (total += i.sp));
    order.total = total;

    await client.query("BEGIN");
    const orderQuery = await client.query(
      ` insert INTO public."order" (
       user_id, order_status, payment_type, delivery_time, delivery_date, address, pincode, city, delivery_area, delivery_instructions,  delivery_charges, total) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id;`,
      [
        req.session.user,
        order.order_status,
        order.payment_type,
        order.delivery_time,
        order.delivery_date,
        order.address,
        order.pincode,
        order.city,
        order.delivery_area,
        order.delivery_instructions,
        order.delivery_charges,
        order.total,
      ]
    );
    console.log(orderQuery);
    const queryText = ` Insert into order_items (order_id,product_id,sku_id,price,quantity) (select ${orderQuery.rows[0].id},skus.product_id,skus.id as sku_id,skus.sp as price,cart_items.quantity as quantity from skus inner join cart_items on skus.id=cart_items.sku_id  where cart_id=${req.session.cartId});
    update skus as sku set sold=new.quantity+sku.sold, updated_at=now() from ( select (quantity) as quantity,sku_id  from cart_items where cart_id=${req.session.cartId}) as new;
                                         delete from cart_items where cart_id=${req.session.cartId};`;
    const queryR = await client.query(queryText);
    let response = await client.query("COMMIT");
    await client.release();
    res.send(orderQuery.rows[0]);
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    await client.release();
  }
});

router.get("/api/order", userMiddleware, async (req, res, next) => {
  try {
    if (!req.query.q) {
      throw new Error("BadInput");
    } else {
      const query = OrderItems.query()
        .withGraphFetched("[productId,skus.images]")
        .where("order_id", +req.query.q);
      const response = await query;

      res.send(response);
    }
  } catch (err) {
    next(err);
  }
});

router.get("/api/orders", userMiddleware, async (req, res, next) => {
  try {
    const query = Order.query().where("user_id", req.session.user);
    const response = await query;

    res.send(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
