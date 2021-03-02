const { Model } = require("objection");
const CartItems = require("./CartItems");
const User = require("./User");

class Cart extends Model {
  static get tableName() {
    return "cart";
  }

  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    const Brand = require("./Brand");

    return {
      cart_items: {
        relation: Model.HasManyRelation,
        modelClass: CartItems,
        join: {
          from: "cart.id",
          to: "cart_items.cart_id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "cart.user_id",
          to: "user.id",
        },
      },
    };
  }
}

module.exports = Cart;
