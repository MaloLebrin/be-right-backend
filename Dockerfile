FROM node:16

RUN mkdir /app
WORKDIR /app

COPY package.json /app/

RUN npm install

COPY ormconfig-docker.json /app/ormconfig.json
COPY .env /app/.env
COPY tsconfig.json /app/
COPY ./src /app/src

ENTRYPOINT ["npm", "run", "start"]
