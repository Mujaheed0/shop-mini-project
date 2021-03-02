const { Model } = require("objection");
class ResultsDummy extends Model {
  static get tableName() {
    return "results_dummy";
  }
}

module.exports = ResultsDummy;
