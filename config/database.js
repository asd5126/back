module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "bookshelf",
      settings: {
        client: "mysql",
        host: env("DATABASE_HOST", process.env.STRAPI_HOST),
        port: env.int("DATABASE_PORT", 3306),
        database: env("DATABASE_NAME", process.env.STRAPI_DATABASE),
        username: env("DATABASE_USERNAME", process.env.STRAPI_USERNAME),
        password: env("DATABASE_PASSWORD", process.env.STRAPI_PASSWORD),
        ssl: env.bool("DATABASE_SSL", false),
        charset: env("DATABASE_CHARSET", "utf8mb4"),
      },
      options: {},
    },
  },
});
