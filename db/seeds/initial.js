const orderedTableNames = require("../../src/constants/orderedTableNames");
const TableNames = require("../../src/constants/TableNames");

exports.seed = async function (knex) {
  await Promise.all(
    orderedTableNames.map(async (promise, table_name) => {
      await promise;
      knex(table_name).del();
    }, Promise.resolve())
  );
  // Deletes ALL existing entries

  const category = {
    name: "Cooking Essentials",
    slug: "cooking-essentials",
  };
  const product_category = {
    name: "Dals & Pulses",
    slug: "dals-pulses",
    image_url:
      "https://images-na.ssl-images-amazon.com/images/I/91mcCz5-jmL._SX425_.jpg",
    category_id: 1,
  };

  await knex(TableNames.category).insert(category).returning("*");
  const res = await knex(TableNames.product_category)
    .insert(product_category)
    .returning("*");
  console.log(res);
};
