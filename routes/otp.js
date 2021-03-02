const User = require("../models/User");
const express = require("express");
const router = express.Router();
const { Joi, validate } = require("express-validation");
// const client = require("twilio")(accountSid, authToken);
const { userMiddleware } = require("../middlewares/middleware");

const Redis = require("ioredis");
const Role = require("../models/Role");
const Cart = require("../models/Cart");
const WishList = require("../models/WishList");

const phoneNumberSchema = {
  body: Joi.object({
    phoneNumber: Joi.number().max(9999999999).min(1000000000).required(),
  }),
};

const otpSchema = {
  body: Joi.object({
    phoneNumber: Joi.number().max(9999999999).min(1000000000).required(),
    otp: Joi.number().max(9999).min(1000).required(),
  }),
};

const errorMessages = {
  invalidLogin: "Invalid login.",
  invalidOtp: "Invalid Otp",
  invalidPhoneNumber: "Invalid Phone Number.",
  serverError: "Server Error. Try again later.",
};

router.get("/api/current", async (req, res, next) => {
  console.log(req.session.cartId);
  try {
    const { user } = req.session;
    if (!req.session.user) {
      res.status(401).send({ id: undefined });
      return;
    }
    const query = User.query()
      .findById(user)
      .withGraphFetched("[address,roles,cart,cart.cart_items]");
    query.debug();

    const response = await query;
    if (response.length) delete response.roles;

    res.status(200).send({ response, isAdmin: req.session.isAdmin });
  } catch (err) {
    next(err);
  }
});

router.get("/api/logout", async (req, res) => {
  console.log(req.session.cookie);

  req.session.destroy((err) => {
    res
      .clearCookie("qid", {
        path: "/",
        domain: ".frozen-reef-15026.herokuapp.com",
      })
      .send({});
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
  });
});

router.post("/api/otp", validate(phoneNumberSchema), async (req, res, next) => {
  const { phoneNumber } = req.body;

  res.status(202).send({ message: "Otp send successfully" });
});

router.post(
  "/api/resend-otp",
  validate(phoneNumberSchema),
  async (req, res, next) => {
    const { phoneNumber } = req.body;

    res.status(202).send({ message: "Otp send successfully" });
  }
);

router.post(
  "/api/validate-otp",
  validate(otpSchema),
  async (req, res, next) => {
    try {
      const { phoneNumber, otp } = req.body;

      if (otp === 4444) {
        let query = User.query()
          .findOne({
            phoneNumber: +phoneNumber,
          })
          .withGraphFetched("[roles,address,cart]");

        const response = await query;
        let isAdmin = false;
        console.log(response);
        if (response) {
          response.roles.map((i) => {
            if (i.role === "admin") {
              isAdmin = true;
              req.session.isAdmin = true;
            } else req.session.isAdmin = false;
          });
          delete response.roles;
          req.session.user = response.id;
          req.session.cartId = response.cart.id;

          res.status(202).send({ response, isAdmin });
        } else {
          let transactionQuery = await User.transaction(async (trx) => {
            let createUserQuery = User.query(trx)
              .insert({ phoneNumber: phoneNumber })
              .returning("*");
            const queryResponse = await createUserQuery;
            const customerRole = await Role.query(trx).where(
              "role",
              "customer"
            );
            const insertRole = User.relatedQuery("roles", trx)
              .for(queryResponse.id)
              .relate(customerRole);
            await insertRole;
            const CartId = await Cart.query(trx)
              .insert({ user_id: queryResponse.id })
              .returning("id");
            console.log(CartId);
            const WishlistId = await WishList.query(trx).insert({
              user_id: queryResponse.id,
              id: CartId.id,
            });
            req.session.cartId = CartId.id;
            req.session.user = queryResponse.id;
            req.session.isAdmin = false;

            return queryResponse;
          });

          transactionQuery.address = [];
          res.status(202).send({ response: transactionQuery, isAdmin: false });
        }
      } else throw new Error("InvalidInput");
    } catch (err) {
      if (err instanceof Error) {
        next(err);
      }
    }
  }
);

module.exports = router;
