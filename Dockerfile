FROM node:18-alpine as base

WORKDIR /home/node/app

COPY ./server package*.json ./

RUN yarn install

COPY ./server .

FROM base as production

ENV NODE_PATH=./build

RUN yarn build

CMD ["node", "build/index.js"]

EXPOSE 3000