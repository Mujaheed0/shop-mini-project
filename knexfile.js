// Update with your config settings.

module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "shop",
      user: "postgres",
      password: "sdfsdfsdfsaf",
      multipleStatements: true,
    },
    debug: true,
    migrations: {
      directory: "./db/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },

  production: {
    client: "postgresql",

    connection: "",
    migrations: {
      directory: "./db/migrations",
    },
    seeds: { directory: "./db/seeds" },

    pool: {
      min: 2,
      max: 10,
    },
  },
};
