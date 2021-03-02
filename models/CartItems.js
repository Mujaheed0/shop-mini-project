const { Model } = require("objection");
const Cart = require("./Cart");
const Product = require("./Product");
const ProductType = require("./Skus");

class CartItems extends Model {
  static get tableName() {
    return "cart_items";
  }
  static get relationMappings() {
    // Importin
    return {
      cartId: {
        relation: Model.BelongsToOneRelation,
        modelClass: Cart,
        join: {
          from: "cart_items.cart_id",
          to: "cart.id",
        },
      },
      productId: {
        relation: Model.HasOneRelation,
        modelClass: Product,
        join: {
          from: "cart_items.product_id",
          to: "product.id",
        },
      },
      skuId: {
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: ProductType,
        join: {
          from: "cart_items.sku_id",

          to: "skus.id",
        },
      },
    };
  }
}

module.exports = CartItems;
