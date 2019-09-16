FROM node:alpine

RUN mkdir -p /usr/src/app

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install

COPY . .
COPY dbConfig.docker.js ./dbConfig.js

# CMD node init/message.js
CMD node index.js
