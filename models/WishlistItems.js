const { Model } = require("objection");
const WishList = require("./WishList");
const Product = require("./Product");
const ProductType = require("./Skus");

class WishlistItems extends Model {
  static get tableName() {
    return "wishlist_items";
  }
  static get relationMappings() {
    // Importin
    return {
      wishlist_Id: {
        relation: Model.BelongsToOneRelation,
        modelClass: WishList,
        join: {
          from: "wishlist_items.wishlist_id",
          to: "wishlist.id",
        },
      },
      productId: {
        relation: Model.HasOneRelation,
        modelClass: Product,
        join: {
          from: "wishlist_items.product_id",
          to: "product.id",
        },
      },
      skuId: {
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: ProductType,
        join: {
          from: "wishlist_items.sku_id",

          to: "skus.id",
        },
      },
    };
  }
}

module.exports = WishlistItems;
