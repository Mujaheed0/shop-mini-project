const { Model } = require("objection");
const Skus = require("./Skus");
class ProductImage extends Model {
  static get tableName() {
    return "product_image";
  }
  static get relationMappings() {
    return {
      product_id: {
        relation: Model.BelongsToOneRelation,
        modelClass: Skus,
        join: {
          from: "product_image.skus_id",
          to: "skus.id",
        },
      },
    };
  }
}
module.exports = ProductImage;
