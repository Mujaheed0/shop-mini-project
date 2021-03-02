const routes = require("./api");

const Knex = require("knex");
const { Model } = require("objection");
const knexConfig = require("./knexfile");
const loginRoute = require("./routes/otp");
const orderRoute = require("./routes/order");
const brandRoute = require("./routes/brand");
const tagRoute = require("./routes/tag");
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/product");
const roleRoute = require("./routes/roles");
const { Pool } = require("pg");

const knex = Knex(knexConfig.production);
const cron = require("node-cron");

Model.knex(knex);
const cors = require("cors");
const express = require("express");
const app = express();
app.set("trust proxy", 1);

const helmet = require("helmet");
const morgan = require("morgan");
app.use(morgan("combined"));

const compression = require("compression");

const Redis = require("ioredis");
let session = require("express-session");
// const pool = new Pool({
//   connectionString:
// connect to postgres db
// });

cron.schedule("*/5 * * * *", () => {
  console.log("running a task every five minutes");
  func();
});

const func = async () => {
  let date = new Date();
  var client = await pool.connect();
  date.setHours(date.getHours() - 0);
  date = date.toLocaleString();

  try {
    await client.query("BEGIN");
    const queryText = ` update skus as sku set stock=new.quantity+sku.stock,  updated_at=now() from ( select sum(quantity) as quantity,sku_id  from cart_items where ('${date}'-created_at)>=interval '02:00:00'  GROUP BY  sku_id) as new where sku.id=new.sku_id; insert into wishlist_items(wishlist_id,product_id,sku_id) (select  cart_id as wishlist_id,product_id,sku_id from cart_items where ('${date}'-created_at)>=interval '02:00:00') ON CONFLICT  DO NOTHING; delete  from cart_items where  ('${date}'-created_at)>=interval '02:00:00'`;
    const queryR = await client.query(queryText);
    let response = await client.query("COMMIT");
    console.log(queryR);
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
};

morgan.token("host", function (req, res) {
  return req.hostname;
});
app.use(compression());

const corsOptions = {
  origin: "https://shop-mini-project.herokuapp.com", // reqexp will match all prefixes
  methods: "GET,HEAD,POST,PATCH,DELETE,OPTIONS",
  credentials: true, // required to pass
  allowedHeaders: "Content-Type,X-Requested-With",
};

app.use(cors(corsOptions));

//=> {host: 'example.com', port: 39143, database: '0', password: 'n9y25ah7'}

app.use(express.json());

app.use(
  session({
    name: "qid",

    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: "lax", // csrf
      secure: true,
      domain: ".shop-mini-project.herokuapp.com", // cookie only works in https
    },
    saveUninitialized: false,
    secret: "dsfsfsdfdsfdsccvasdxcsfasdfdsfasfasdf",
    resave: false,
  })
);

const userRoute = require("./routes/user");
const cartRoute = require("./routes/cart");
const wishlistRoute = require("./routes/wishlist");
const middlewares = require("./middlewares/middleware");
const errorHandler = require("./middlewares/objectionErrorHandler");
const { image } = require("faker");
const imageUpload = require("./routes/imageUpload");

app.use(routes);
app.use(brandRoute);
app.use(loginRoute);
app.use(productRoute);
app.use(tagRoute);
app.use(wishlistRoute);
app.use(categoryRoute);
app.use(orderRoute);
app.use(userRoute);
app.use(cartRoute);

require("./routes/imageUpload")(app);
app.use(roleRoute);
app.use(errorHandler);
const path = require("path");
app.use(middlewares.errorHandler);
app.use(express.static(__dirname + "/build"));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});
const { PORT = 8080, LOCAL_ADDRESS = "0.0.0.0" } = process.env;
app.listen(PORT, LOCAL_ADDRESS, () => console.log("listening"));
