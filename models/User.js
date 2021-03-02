const { Model } = require("objection");
const Cart = require("./Cart");
const Order = require("./Order");
const Address = require("./Address");
const Role = require("./Role");

class User extends Model {
  static get tableName() {
    return "user";
  }
  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.

    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: "user.id",
          through: {
            from: "role_user.user_id",
            to: "role_user.role_id",
          },
          to: "roles.id",
        },
      },
      cart: {
        relation: Model.HasOneRelation,
        modelClass: Cart,
        join: {
          from: "user.id",
          to: "cart.user_id",
        },
      },
      orders: {
        relation: Model.HasManyRelation,
        modelClass: Order,
        join: {
          from: "user.id",
          to: "order.user_id",
        },
      },
      address: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: Address,
        join: {
          from: "user.id",
          to: "address.user_id",
        },
      },
    };
  }
}

module.exports = User;
