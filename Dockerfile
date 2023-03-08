FROM node:18.15

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
ENV NODE_ENV=${NODE_ENV}

COPY .env /app/.env
COPY ormconfig.ts /app/ormconfig.ts
COPY tsconfig.json /app/
COPY entrypoint.sh /app/
COPY scriptSeed.sh /app/
COPY ./src /app/src

RUN nr tsc

RUN chmod +x /app/entrypoint.sh
RUN chmod +x /app/scriptSeed.sh
ENTRYPOINT ["/bin/bash","/app/entrypoint.sh"]
