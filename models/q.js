const { Model } = require("objection");

class UpsertQueryBuilder extends Model.QueryBuilder {
  upsert(object) {
    const modelClass = this.modelClass();
    const knex = this.knex();

    const cols = Object.keys(object);
    const values = Object.values(object);

    const colBindings = cols.map(() => "??").join(", ");
    const valBindings = cols.map(() => "?").join(", ");
    const setBindings = cols.map(() => "?? = ?").join(", ");

    const setValues = [];
    for (let i = 0; i < cols.length; ++i) {
      setValues.push(cols[i], values[i]);
    }

    return this.onBuildKnex((query) => {
      query.insert(
        knex.raw(
          [
            `(${colBindings}) VALUES (${valBindings})`,
            `ON CONFLICT (??) DO NOTHING`,
          ].join(" "),
          [...cols, ...values]
        )
      );
    });
  }
}
module.exports = UpsertQueryBuilder;
