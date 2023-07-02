FROM node:18 as base

WORKDIR /home/node/app

COPY ./server package*.json ./

RUN yarn install

COPY ./server .

FROM base as production

RUN yarn build

CMD ["node", "dist/app.js"]

EXPOSE 3333