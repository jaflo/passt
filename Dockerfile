FROM node:10-slim
WORKDIR /app
COPY package*.json /app/
COPY tsconfig.json /app/
COPY server /app/server
RUN npm install
RUN npm run compile
CMD ["npm", "run", "start:server"]