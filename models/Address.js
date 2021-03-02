const { Model } = require("objection");
const User = require("./User");

class Address extends Model {
  static get tableName() {
    return "address";
  }
  static get relationMappings() {
    // One way to prevent circular references
    // is to require the model classes here.

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: User,
        join: {
          from: "address.user_id",
          to: "user.id",
        },
      },
    };
  }
}

module.exports = Address;
