FROM node:10-slim
WORKDIR /app
COPY package*.json /app/
COPY tsconfig.json /app/
COPY .mocharc.json /app/
COPY ormconfig.js /app/
COPY prettier.config.js /app/
COPY server /app/server
COPY test /app/test
RUN npm install
RUN npm run compile
CMD ["npm", "run", "start:server"]