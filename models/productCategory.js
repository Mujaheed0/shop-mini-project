// const { Model } = require("objection");
// const Product = require("./Product");
// const Category = require("./Category");

// class ProductCategory extends Model {
//   static get tableName() {
//     return "product_category";
//   }
//   static get relationMappings() {
//     // One way to prevent circular references
//     // is to require the model classes here.

//     return {
//       products: {
//         relation: Model.HasOneRelation,
//         // The related model. This can be either a Model subclass constructor or an
//         // absolute file path to a module that exports one.
//         modelClass: Product,
//         join: {
//           from: "product_category.id",
//           to: "product.product_category_id",
//         },
//       },
//       category: {
//         relation: Model.HasOneRelation,
//         // The related model. This can be either a Model subclass constructor or an
//         // absolute file path to a module that exports one.
//         modelClass: Category,
//         join: {
//           from: "product_category.category_id",
//           to: "category.id",
//         },
//       },
//     };
//   }
// }

// module.exports = ProductCategory;
