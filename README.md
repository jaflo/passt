# Passt

WIP, check back later

```bash
cd passt
npm install
npm run dev:client
```

## Server

For setting up the server for the first time or after a `docker system prune`, do:

```bash
docker-compose up -d
docker-compose exec db su postgres
psql # in container
CREATE DATABASE passt; # in PostgreSQL prompt, for actual local data
CREATE DATABASE passttest; # in PostgreSQL prompt, for testing data
# Leave PostgreSQL and container
docker-compose restart
docker-compose exec web npm run typeorm migration:run
```