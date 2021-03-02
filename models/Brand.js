const { Model } = require("objection");
const Product = require("./Product");

class Brand extends Model {
  static get tableName() {
    return "brand";
  }
  static get relationMappings() {
    // One way to prevent circular references
    // is to require the model classes here.

    return {
      products: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: Product,
        join: {
          from: "brand.id",
          to: "product.brand_id",
        },
      },
    };
  }
}

module.exports = Brand;
