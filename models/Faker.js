const { Model } = require("objection");

class Faker extends Model {
  static get tableName() {
    return "name";
  }
}
module.exports = Faker;
