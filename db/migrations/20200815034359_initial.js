const TableNames = require("../../src/constants/TableNames");
const Knex = require("knex");
function addDefaultColumns(table) {
  table.timestamps(false, true);
}

function image(table, columnName) {
  table.string(columnName, 2000);
}

/*
@params(require('knex').Knex)
*/

/**
 * @param {Knex} knex
 */

exports.up = async (knex) => {
  await Promise.all([
    // knex.schema.createTable("otp", (table) => {
    //   table.increments().notNullable().primary();
    //   table.bigInteger("phoneNumber").notNullable();
    //   table.bigInteger("otp").notNullable();
    // }),

    // knex.schema.createTable("roles", (table) => {
    //   table.increments().notNullable().primary();
    //   table.string("role", 100).notNullable();
    // }),
    // knex.schema.createTable("role_user", (table) => {
    //   table.increments().notNullable().primary();
    //   table.integer("role_id").references("roles.id");
    //   table.integer("user_id").references("user.id");
    // }),
    // knex.schema.createTable(TableNames.user, (table) => {
    //   table.increments().notNullable().primary();
    //   table.bigInteger("phoneNumber").notNullable();
    //   table.string("name", 150).notNullable();
    //   table.string("email", 150);

    //   addDefaultColumns(table);
    // }),

    // knex.schema.createTable(TableNames.category, (table) => {
    //   table.increments("id").notNullable();
    //   table.string("slug", 100).notNullable();
    //   table.string("name", 100).notNullable();
    //   table.string("image", 1000).notNullable();
    //   table
    //     .integer("parentId")
    //     .unsigned()
    //     .references("category.id")

    //     .onDelete("CASCADE")
    //     .index();
    //   addDefaultColumns(table);
    // }),
    // // knex.schema.createTable(TableNames.product_category, (table) => {
    // //   table.increments().notNullable();
    // //   table.string("slug", 100).notNullable();
    // //   table.string("name", 100).notNullable();
    // //   table.string("image_url", 300).notNullable();
    // //   table
    // //     .integer("category_id")
    // //     .references("category.id")
    // //     .onDelete("CASCADE");

    // //   addDefaultColumns(table);
    // // }),
    // knex.schema.createTable(TableNames.brand, (table) => {
    //   table.increments().notNullable();
    //   table.string("nm", 50).notNullable();
    // }),
    // //@knex
    // knex.schema.createTable("skus", (table) => {
    //   table.increments("id").notNullable();
    //   table.float("mrp");
    //   table.float("sp");
    //   table.float("dealp");
    //   table.boolean("isDefault");
    //   table.boolean("inDeal");
    //   table.boolean("offerOnly");

    //   table.boolean("isNewArrvl");
    //   table.boolean("outOfStock");

    //   table.boolean("isTopSeller");
    //   table.string("promoText", 500);

    //   table.string("promoShortText", 500);
    //   table.integer("minQty").defaultTo(1),
    //     table.integer("maxQty").defaultTo(1000),
    //     image(table, "image");
    //   table.string("saleQtyUnitCode", 100);
    //   table.string("priceUnitCode", 100);
    //   // table.float("discount").defaultTo(0);
    //   table.string("name", 100);
    //   table.string("desc", 300).defaultTo("");
    //   // table.float("selling_price").notNullable();
    //   table.integer("stock").unsigned().defaultTo(0);
    //   table.integer("product_id").references("product.id").onDelete("CASCADE");

    //   addDefaultColumns(table);
    // }),
    // knex.schema.createTable(TableNames.product, (table) => {
    //   table.increments().notNullable();
    //   table.string("name", 200).notNullable().unique();
    //   table.text("desc").notNullable();
    //   image(table, "image");

    //   // table.boolean("show");
    //   // table.float("default_selling_price");
    //   // table.float("default_discount");
    //   // table.integer("sold_items").unsigned();
    //   table.integer("brand_id").references("brand.id").onDelete("CASCADE");

    //   addDefaultColumns(table);
    // }),
    // knex.schema.createTable("product_category", (table) => {
    //   table.increments().primary();
    //   table
    //     .integer("category_id")
    //     .references("category.id")
    //     .onDelete("CASCADE");
    //   table.integer("product_id").references("product.id").onDelete("CASCADE");
    // }),
    // knex.schema.createTable(TableNames.tag, (table) => {
    //   table.increments().notNullable();
    //   table.string("tag", 50).notNullable().unique();
    //   table.integer("product_id").references("product.id").onDelete("CASCADE");
    // }),
    // knex.schema.createTable(TableNames.cart, (table) => {
    //   table.increments().notNullable().primary();
    //   table
    //     .integer("user_id")
    //     .notNullable()
    //     .references("user.id")
    //     .onDelete("CASCADE");
    // }),
    knex.schema.createTable("wishlist", (table) => {
      table.increments().notNullable().primary();
      table
        .integer("user_id")
        .notNullable()
        .references("user.id")
        .onDelete("CASCADE");
    }),
    // knex.schema.createTable(TableNames.cart_items, (table) => {
    //   table.increments().notNullable().primary();
    //   table
    //     .integer("cart_id")
    //     .notNullable()
    //     .references("cart.id")
    //     .onDelete("CASCADE");
    //   table
    //     .integer("product_id")
    //     .notNullable()
    //     .references("product.id")
    //     .onDelete("CASCADE");
    //   table
    //     .integer("sku_id")
    //     .notNullable()
    //     .references("skus.id")
    //     .onDelete("CASCADE");
    //   table.integer("quantity").notNullable();
    //   addDefaultColumns(table);
    // }),
    knex.schema.createTable("wishlist_items", (table) => {
      table.increments().notNullable().primary();
      table
        .integer("wishlist_id")
        .notNullable()
        .references("wishlist.id")
        .onDelete("CASCADE");
      table
        .integer("product_id")
        .notNullable()
        .references("product.id")
        .onDelete("CASCADE");
      table
        .integer("sku_id")
        .notNullable()
        .references("skus.id")
        .onDelete("CASCADE");

      addDefaultColumns(table);
    }),
    // knex.schema.createTable(TableNames.order, (table) => {
    //   table.increments().notNullable().primary();
    //   table
    //     .integer("user_id")
    //     .notNullable()
    //     .references("user.id")
    //     .onDelete("CASCADE");
    //   table.string("order_status").notNullable();
    //   table.string("payment_type").notNullable();
    //   table.string("delivery_time").notNullable();
    //   table.string("delivery_date").notNullable();
    //   table.string("address").notNullable();
    //   table.string("house_no").notNullable();
    //   table.string("pincode").notNullable();
    //   table.string("city").notNullable();
    //   table.string("delivery_area").notNullable();
    //   table.string("delivery_instructions");
    //   table.float("sgst");
    //   table.float("cgst");

    //   table.float("delivery_charges").notNullable();
    //   table.float("total").notNullable();
    // }),

    // knex.schema.createTable(TableNames.order_items, (table) => {
    //   table.increments().notNullable().primary();
    //   table
    //     .integer("order_id")
    //     .notNullable()
    //     .references("order.id")
    //     .onDelete("CASCADE");
    //   table
    //     .integer("product_id")
    //     .notNullable()
    //     .references("product.id")
    //     .onDelete("CASCADE");

    //   table.float("item_price").notNullable();
    //   table.string("item_type").notNullable();
    //   table.integer("quantity").notNullable();
    // }),
    // knex.schema.createTable(TableNames.address, (table) => {
    //   table.increments().notNullable().primary();
    //   table
    //     .integer("user_id")
    //     .notNullable()
    //     .references("user.id")
    //     .onDelete("CASCADE");
    //   table.string("city").notNullable();
    //   table.string("delivery_area", 50).notNullable();
    //   table.string("address", 200).notNullable();
    //   table.string("house_no", 200).notNullable();
    //   table.integer("pincode").notNullable();
    // }),
  ]);
};

/**
 * @param {Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists(TableNames.user);
  await knex.schema.dropTableIfExists(TableNames.product_category);
  await knex.schema.dropTableIfExists(TableNames.category);
  await knex.schema.dropTableIfExists(TableNames.product_type);
  await knex.schema.dropTableIfExists(TableNames.product);
  await knex.schema.dropTableIfExists(TableNames.brand);
  await knex.schema.dropTableIfExists(TableNames.tag);
};
