const { Model } = require("objection");
const Image = require("./Image");
class Skus extends Model {
  static get tableName() {
    return "skus";
  }
  static modifiers = {
    sold(query) {
      query.groupByRaw("skus.id").orderByRaw("max(skus.sold) desc");
    },
    min_sp(query) {
      query.groupByRaw("skus.id").orderByRaw("min(skus.sp) asc");
    },
    max_sp(query) {
      query.groupByRaw("skus.id").orderByRaw("max(skus.sp) desc");
    },
    discount(query) {
      query.groupByRaw("skus.id").orderByRaw("max(skus.discount) desc");
    },
    created_at(query) {
      query.groupByRaw("skus.id").orderByRaw("skus.created_at desc");
    },
  };
  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    const Product = require("./Product");

    return {
      product: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: Product,
        join: {
          from: "skus.product_id",
          to: "product.id",
        },
      },
      images: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: Image,
        join: {
          from: "skus.id",
          to: "product_image.sku_id",
        },
      },
    };
  }
}

module.exports = Skus;
