const { Model } = require("objection");
const ProductCategory = require("./productCategory");
const Product = require("./Product");

class Category extends Model {
  static get tableName() {
    return "product_category";
  }
  static get relationMappings() {
    // One way to prevent circular references
    // is to require the model classes here.

    return {
      subCat: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: Category,
        join: {
          from: "product_category.id",
          to: "product_category.category_id",
        },
      },

      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: 'product_category.category_id',
          to: 'product_category.id'
        }
      }
      , products: {
        relation: Model.HasManyRelation,
        modelClass: Product,
        join: {
          from: 'product_category.id',

          to: 'product.product_category_id'
        }
      },
      all_products: {
        relation: Model.HasManyRelation,
        modelClass: Product,
        join: {
          from: 'product_category.id',

          to: 'product.category_id'
        }
      }


    };
  }
}

module.exports = Category;
