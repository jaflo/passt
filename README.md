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
docker-compose run web npm run typeorm migration:run
```

### Testing
To run tests on the Docker container:

```bash
docker-compose run web npm test # If the server isn't running already

# OR

docker-compose exec web npm test # If the server IS running elsewhere.
```