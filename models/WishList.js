const { Model } = require("objection");
const WishlistItems = require("./WishlistItems");
const User = require("./User");

class WishList extends Model {
  static get tableName() {
    return "wishlist";
  }

  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.

    return {
      cart_items: {
        relation: Model.HasManyRelation,
        modelClass: WishlistItems,
        join: {
          from: "wishlist.id",
          to: "wishlist_items.wishlist_id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "wishlist.user_id",
          to: "user.id",
        },
      },
    };
  }
}

module.exports = WishList;
