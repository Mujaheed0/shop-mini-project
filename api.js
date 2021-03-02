const Product = require("./models/Product");
const express = require("express");
const router = express.Router();
const Knex = require("knex");
const fs = require("fs");
// let category = require('./client.json');
const {
  Model,
  ForeignKeyViolationError,
  ValidationError,
  ConstraintViolationError,
  DBError,
} = require("objection");

const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Cart = require("./models/Cart");
const CartItems = require("./models/CartItems");
const Address = require("./models/Address");
const ProductType = require("./models/Skus");
const Category = require("./models/Category");
const Brand = require("./models/Brand");
const { raw } = require("objection");
const Skus = require("./models/Skus");

// router.get("/api/current", async () => {
//   const query = User.query().deleteById(1);
//   await query;
// });

router.post("/api/current", async (req, res) => {
  console.log(req.ip);
  if (req.body.jwt) {
    const payload = jwt.verify(req.body.jwt, "secrets-secrets");
    const query = User.query().withGraphFetched("address").findById(2);
    const response = await query;
    res.send(response);
  } else {
    res.send();
  }
});

router.post("/brand", async (req, res) => {
  const query = Brand.query().insert(req.body);
  await query;
  res.send("success");
});

router.post("/product", async (req, res) => {
  try {
    const { products } = req.body;
    const query = Product.transaction((t) =>
      Product.query().transacting(t).insertGraph(products).returning("*")
    );
    query.debug();
    console.log(req.body);
    const response = await query;

    res.send(response);
  } catch (e) {
    console.log(e);
    res.send("error");
  }
});

router.get("/brand", async (req, res) => {
  const query = Brand.query();
  const response = await query;
  res.send(response);
});

router.patch("/brand", async (req, res) => {
  const product = Product.query()
    .patch({ brand_id: req.body.brand_id })
    .where("id", req.body.id)
    .returning("*");
  const p = await product;
  res.send(p);
});

// router.get('/product',async(req,res)=>{
//   const query=Product.query().first().withGraphFetched('[skus,category]');
//   const response=await query;
//   res.send(response)
// })

router.get("/product", async (req, res) => {
  // const stories = await Story
  //       .query()
  //       .whereExists(f
  //         Story.relatedQuery('Readers')
  //       )
  //       .select([
  //         'story.headline',
  //         Story.relatedQuery('Readers')
  //           .count('story_id')
  //           .groupBy('story_id')
  //           .as('view_ct')
  //       ])
  //       .orderBy('view_ct', 'DESC')
  //       .limit(4)
  //       .debug();
  // 'select   "product".* from "product"  inner join  (select distinct product_id from tag  where  similarity(tag,?)>0 )v    on v.product_id=product.id  order by similarity(name,?) desc limit 2  ';
  const random = Math.floor(Math.random() * 100);

  const query = Category.relatedQuery("products")
    .for(6189)
    .select(
      raw("product.id,product.name,product.image,product.desc,min(skus.sp)sp")
    )
    .innerJoinRelated("skus")
    .groupBy("product.id")
    .orderBy("sp");
  query.withGraphFetched("[skus]").page(random, 10);
  query.debug();
  const response = await query;
  res.send(response);
});

// router.get('/categor', async (req, res) => {
//   category.category.forEach(i => {

//     i.slug = slug(i.name),
//       i.image = i.imageGV
//     delete i.imageLV,
//       delete i.imageGV
//     i.subCat.forEach(j => {
//       j.slug = slug(j.name),
//         j.image = i.image

//       delete j.imageLV,
//         delete j.imageGV
//     });

//   })

//   const query = Category.query().insertGraph(category.category);
//   query.debug();
//   await query
//   res.send(category);
// })

router.get("/categor", async (req, res) => {
  const query = Category.query()
    .withGraphFetched("[subCat(sub)]")
    .whereNull("parentId")
    .select(["name", "id", "image", "slug"])
    .modifiers({
      sub: (query) => query.select(["name", "id", "slug", "image"]),
    });
  query.debug();
  const response = await query;
  res.send(response);
});

router.delete("/api/address", async (req, res) => {
  const query = Address.query().deleteById(req.body.id).debug();
  await query;
  res.sendStatus(204);
});

router.patch("/api/address", async (req, res) => {
  const { address } = req.body;
  const query = Address.query().patch(address).where("id", address.id).debug();
  await query;
  res.sendStatus(204);
});

router.post("/api/address", async (req, res) => {
  const { address, defaultAddress } = req.body;
  console.log(defaultAddress);

  const query = Address.query().insert(address).debug();
  const response = await query;
  if (defaultAddress) {
    const query = User.query().patch({ default_address: response.id });
    await query;
  }
  res.send(response);
});
router.get("/api/address", async (req, res) => {
  const query = Address.query();
  const response = await query;

  res.send(response);
});

// router.post("/api/order", async (req, res) => {
//   if (req.body.jwt) {
//     const payload = jwt.verify(req.body.jwt, "secrets-secrets");

//     res.send(payload);
//   }
// });

router.patch("/product", async (req, res) => {
  try {
    const sku = req.body.sku;

    const query = Skus.query().patch({ sku: sku.name }).findById(sku.id);
    await query;
    res.send("update");
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/api/users/signin",

  async (req, res) => {
    const { phoneNumber } = req.body;

    console.log(phoneNumber);
    let user;
    const query = User.query().findOne({ phoneNumber: phoneNumber });
    const response = await query;
    if (response) {
      user = response;
    } else {
      user = await User.query()
        .insert({
          phoneNumber: phoneNumber,
        })
        .returning("*");
    }

    const userJwt = jwt.sign(
      {
        id: user.id,
        phoneNumber: user.phoneNumber,
      },
      "secrets-secrets"
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };
    res.send({ user, userJwt });
  }
);

router.get("/user", async (req, res) => {
  const query = User.query()
    .withGraphFetched("[cart,orders]")
    .where("id", req.query.q)
    .debug();
  const response = await query;
  res.send(response);
});

router.get("/cart", async (req, res) => {
  const query = CartItems.query()
    .withGraphFetched("[productId,TypeId]")

    .where("cart_id", req.query.q)
    .debug();
  const response = await query;
  res.send(response);
});

router.post("/cart", async (req, res) => {
  const query = CartItems.query().insertGraph(req.body.cart).debug();
  const response = await query;
  res.send(response);
});

router.post("/user", async (req, res) => {
  const query = User.query().insertGraph(req.body.user).debug();
  const response = await query;
  res.send(response);
});

router.delete("/cart", async (req, res) => {
  const query = Cart.query()
    .delete()
    .where("user_id", req.query.q)
    .returning("*");
  const response = await query;
  res.send(response);
});

router.patch("/cart", async (req, res) => {
  const { q, quantity, cartId } = req.body;

  console.log(q, quantity, cartId);
  const updateQuery = CartItems.query();
  const query = CartItems.query()
    .select(["quantity", "id"])
    .findOne({ product_type_id: q, cart_id: cartId });
  const item = await query;

  if (item.quantity === 1 && quantity < 0) {
    console.log("item");
    updateQuery.deleteById(item.id).returning("*");
  } else {
    updateQuery
      .increment("quantity", quantity)
      .where("id", item.id)
      .returning("*");
  }
  // const query = CartItems.query()
  //   .where("product_type_id", q)
  //   .andWhere("cart_id", cartId)
  //   .increment("quantity", quantity)
  //   .returning("*")
  //   .debug();
  const response = await updateQuery;
  res.send(response);
});

// router.post("/order", async (req, res) => {
//   const query = Order.query().insertGraph(req.body.order).debug();
//   const response = await query;
//   res.send(response);
// });

router.post("/product/brand", async (req, res, next) => {
  const { brand_filter } = req.body;
  console.log(brand_filter);

  const query = Product.query()
    .withGraphFetched("[types]")
    .orderBy("default_discount", "asc");

  // .from(
  //   Product.query()
  //     .withGraphFetched("types(order)")
  //     .modifiers({
  //       order(query) {
  //         query
  //           // We need to order by streamer_id for `distinct on` to work.
  //           .orderBy(["product_id", { column: "mrp", order: "asc" }]);
  //         // This causes first item to be selected for streamer, and since we
  //         // ordered by created_at, it's the newest.
  //       },
  //     })
  // )
  // .aliasFor("p");
  if (req.query.select) {
    query.select(req.query.select);
  }

  if (brand_filter) {
    query.whereIn("brand.id", brand_filter);
  }
  query.debug();
  const response = await query.returning("*");
  console.table(response);
  res.send(response);
});

// router.get("/", async (req, res, next) => {
//   console.log(req.query.q);
//   const query = Tag.query()
//     .select(["product_id"])
//     .groupByRaw(["product_id"])
//     .whereRaw("(similarity(tag,?) )>0", [req.query.q])
//     .orderByRaw("(similarity(tag,?) )", [req.query.q])
//     // .orderByRaw("(similarity(tag,?) )", [req.query.q])
//     .debug();
//   // const rawQuery =.
//   //   "SELECT *, similarity(tag, ?) AS sml FROM tag WHERE  similarity(tag, ?) > 0 ORDER BY similarity(tag, ?)  DESC LIMIT 5;";

//   // const response = await knex.raw(rawQuery, [
//   //   req.query.q,
//   //   req.query.q,
//   //   req.query.q,
//   // ]);
//   const response = await query;
//   console.table(response);
//   res.send(response);
// });
// let names = [];
// let faker = require("faker/locale/en");

// for (let i = 0; i < 10000; i++) {
//   names.push({ name: faker.name.findName() });
// }

// var json2xls = require("json2xls");
// const fs = require("fs");
// router.get("/hi", async (req, res) => {
//   console.time("dbsave");
//   convert();
//   // const XLSX = require("xlsx");
//   // const workbook = XLSX.readFile("result.xlsx");
//   // const sheet_name_list = workbook.SheetNames;
//   // console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]));
//   // res.send(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list]));
//   console.timeEnd("dbsave");
// });
// const filename = "sample.xlsx";
// const allUsers = require("./a.json");
// var convert = function () {
//   var xls = json2xls(allUsers);
//   fs.writeFileSync(filename, xls, "binary", (err) => {
//     if (err) {
//       console.log("writeFileSync :", err);
//     }
//     console.log(filename + " file is saved!");
//   });
// };
module.exports = router;
