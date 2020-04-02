const PostgressConnectionStringParser = require('pg-connection-string');
if (!process.env.DATABASE_URL) {
   console.error("Please supply the DATABASE_URL environment variable");
}
const connectionOptions = PostgressConnectionStringParser.parse(process.env.DATABASE_URL);
module.exports = {
   type: "postgres",
   host: connectionOptions.host,
   port: connectionOptions.port || 5432,
   username: connectionOptions.user,
   password: connectionOptions.password,
   database: connectionOptions.database,
   entities: ["server/entity/*.entity.ts"],
   migrations: ["server/migrations/*.ts"],
   cli: {
      migrationsDir: "server/migrations"
   }
}