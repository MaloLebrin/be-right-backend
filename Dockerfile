FROM node:19

RUN mkdir /app
WORKDIR /app

COPY package.json /app/
COPY pnpm-lock.yaml /app/

# RUN npm install
RUN npm i -g pnpm
RUN npm i -g @antfu/ni

RUN nci

# Be careful with this env variable
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-dev}

COPY .env /app/.env
COPY ormconfig-docker.json /app/ormconfig.json
COPY tsconfig.json /app/
COPY entrypoint.sh /app/
COPY Heroku.yml /app/
COPY ./src /app/src

RUN nr tsc

RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/bin/bash","/app/entrypoint.sh"]
