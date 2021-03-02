const { Model } = require("objection");
const Product = require("./Product");
const ProductType = require("./Skus");
const Order = require("./Order");
const Skus = require("./Skus");

class OrderItems extends Model {
  static get tableName() {
    return "order_items";
  }
  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    const Brand = require("./Brand");

    return {
      orderId: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: "order_items.order_id",
          to: "order.id",
        },
      },
      productId: {
        relation: Model.HasOneRelation,
        modelClass: Product,
        join: {
          from: "order_items.product_id",
          to: "product.id",
        },
      },
      skus: {
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: Skus,
        join: {
          from: "order_items.sku_id",

          to: "skus.id",
        },
      },
    };
  }
}

module.exports = OrderItems;
