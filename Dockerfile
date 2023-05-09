FROM zenika/alpine-chrome:with-puppeteer

USER root

RUN git config --system --add safe.directory '*'

RUN apk add --no-cache ttf-liberation

# RUN mkdir /app
WORKDIR /app

COPY package.json /app/
COPY pnpm-lock.yaml /app/

# RUN npm install
RUN npm i -g pnpm

RUN pnpm install --frozen-lockfile --unsafe-perm \
    && chown -R 0:0 /app/node_modules

# RUN mkdir node_modules/.cache
# RUN chmod -R 777 node_modules/.cache
# Be careful with this env variable
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

# COPY .env /app/.env
COPY ormconfig.ts /app/ormconfig.ts
COPY tsconfig.json /app/
COPY entrypoint.sh /app/
COPY scriptSeed.sh /app/
COPY ./src /app/src

RUN pnpm run tsc

RUN chmod +x /app/entrypoint.sh
RUN chmod +x /app/scriptSeed.sh

RUN chmod -R 777 /app/src/uploads
RUN chmod 777 /app/build/src/middlewares/

USER chrome
# RUN chmod +x /app/uploads

ENTRYPOINT ["node", "/app/build/src/index.js"]
# ENTRYPOINT ["/bin/bash","/app/entrypoint.sh"]
