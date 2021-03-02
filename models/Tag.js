const { Model } = require("objection");
const Product = require("./Product");
class Tag extends Model {
  static get tableName() {
    return "tag";
  }
  static get relationMappings() {
    // One way to prevent circular references
    // is to require the model classes here.

    return {
      products: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: Product,
        join: {
          from: "tag.product_id",

          to: "product.id",
        },
      },
    };
  }
}

module.exports = Tag;
