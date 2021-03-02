const { Model } = require("objection");
const OrderItems = require("./order_items");
const User = require("./User");

class Order extends Model {
  static get tableName() {
    return "order";
  }

  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.

    return {
      order_items: {
        relation: Model.HasManyRelation,
        modelClass: OrderItems,
        join: {
          from: "order.id",
          to: "order_items.order_id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "order.user_id",
          to: "user.id",
        },
      },
    };
  }
}

module.exports = Order;
