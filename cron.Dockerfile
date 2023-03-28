FROM node:18

RUN mkdir /app
WORKDIR /app

COPY package.json /app/
COPY pnpm-lock.yaml /app/

# RUN npm install
RUN npm i -g pnpm
RUN pnpm install --no-frozen-lockfile

# Be careful with this env variable
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

COPY .env /app/.env
COPY ormconfig.ts /app/ormconfig.ts
COPY tsconfig.json /app/

COPY cronScript.sh /app/

COPY ./src /app/src

RUN pnpm run tsc

RUN chmod +x /app/cronScript.sh

ENTRYPOINT ["/bin/bash","/app/cronScript.sh"]
