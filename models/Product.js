const { Model } = require("objection");
const Skus = require("./Skus");
const ProductCategory = require("./productCategory");
const Tag = require("./Tag");
const schema = require("../db/schema/product.json");

class Product extends Model {
  static get tableName() {
    return "product";
  }


  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    const Brand = require("./Brand");

    const Category = require("./Category");
    return {
      category: {
        relation: Model.HasOneRelation,
        modelClass: Category,
        join: {
          from: "product.category_id",

          to: "product_category.id",
        },
      },
      product_category: {
        relation: Model.HasOneRelation,
        modelClass: Category,
        join: {
          from: "product.product_category_id",

          to: "product_category.id",
        },
      },

      tags: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: Tag,
        join: {
          from: "product.id",

          to: "tag.product_id",
        },
      },

      brand: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: Brand,
        join: {
          from: "product.brand_id",
          to: "brand.id",
        },
      },

      skus: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: Skus,
        join: {
          from: "product.id",
          to: "skus.product_id",
        },
      },
    };
  }
  static get jsonSchema() {
    return {
      type: "object",

      required: ["name"],
      properties: {
        name: {
          $id: "#/properties/name",
          type: "string",
          title: "The name schema",
          description: "An explanation about the purpose of this instance.",
          default: "",
          examples: [Array],
        },
        // description: {
        //   $id: "#/properties/description",
        //   type: "string",
        //   title: "The description schema",
        //   description: "An explanation about the purpose of this instance.",
        //   default: "",
        //   examples: [Array],
        // },
        // image_url: {
        //   $id: "#/properties/image_url",
        //   type: "string",
        //   title: "The image_url schema",
        //   description: "An explanation about the purpose of this instance.",
        //   default: "",
        //   examples: [Array],
        // },
        // brand_id: {
        //   $id: "#/properties/brand_id",
        //   type: "integer",
        //   title: "The brand_id schema",
        //   description: "An explanation about the purpose of this instance.",
        //   default: 0,
        //   examples: [Array],
        // },
        // category_id: {
        //   $id: "#/properties/category_id",
        //   type: "integer",
        //   title: "The category_id schema",
        //   description: "An explanation about the purpose of this instance.",
        //   default: 0,
        //   examples: [Array],
        // },
        // product_category_id: {
        //   $id: "#/properties/product_category_id",
        //   type: "integer",
        //   title: "The product_category_id schema",
        //   description: "An explanation about the purpose of this instance.",
        //   default: 0,
        //   examples: [Array],
        // },
        // tags: {
        //   $id: "#/properties/tags",
        //   type: "array",
        //   title: "The tags schema",
        //   description: "An explanation about the purpose of this instance.",
        //   default: [],
        //   examples: [Array],
        //   additionalItems: true,
        //   items: [Object],
        // },
      },
      additionalProperties: true,
    };
  }
}

module.exports = Product;
