# Passt

WIP, check back later

## Client

```bash
npm install
npm run dev:client
```

## Server

For setting up the server for the first time or after a `docker system prune`, do:

```bash
docker-compose run web npm run typeorm migration:run
```

### Testing
To run tests on the Docker container:

```bash
docker-compose run web npm test # If the server isn't running already

# OR

docker-compose exec web npm test # If the server IS running elsewhere.
```

### Local Development

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
docker-compose down # after you're done
```

Make changes to the TypeScript files and wait for the server to come back up ("Listening on port 3000") after compilation.
