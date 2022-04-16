FROM node:16

RUN mkdir /app
WORKDIR /app

COPY package.json /app/

RUN npm install

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-dev}

COPY .env /app/.env
COPY ormconfig-docker.json /app/ormconfig.json
COPY tsconfig.json /app/
COPY heroku.yml /app/
COPY ./src /app/src

RUN npm run tsc
CMD ["npm", "run", "build"]
