const PostgressConnectionStringParser = require('pg-connection-string');
if (!process.env.DATABASE_URL) {
   console.error("Please supply the DATABASE_URL environment variable");
}
module.exports = {
   type: "postgres",
   url: process.env.DATABASE_URL,
   entities: ["server/entity/*.entity.ts"],
   migrations: ["server/migrations/*.ts"],
   cli: {
      migrationsDir: "server/migrations"
   }
}