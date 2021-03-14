if (!process.env.DATABASE_URL) {
   console.error("Please supply the DATABASE_URL environment variable");
}
module.exports = {
   type: "postgres",
   url: process.env.DATABASE_URL,
   ssl: process.env.DATABASE_SSL,
   entities: ["build/server/entity/*.js"],
   migrations: ["build/server/migrations/*.js"],
   cli: {
      migrationsDir: "server/migrations"
   }
}