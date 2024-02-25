FROM zenika/alpine-chrome:with-puppeteer

USER root

RUN git config --system --add safe.directory '*'

RUN apk add --no-cache ttf-liberation

# RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
COPY pnpm-lock.yaml /app/

RUN npm i -g pnpm \
    && pnpm install --no-frozen-lockfile --unsafe-perm \
    && chown -R 0:0 /app/node_modules

# RUN mkdir -p node_modules/.cache
# RUN chmod -R 777 node_modules/.cache
# Be careful with this env variable
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

# COPY .env /app/.env
COPY ormconfig.ts /app/ormconfig.ts
COPY tsconfig.json /app/

COPY ./src /app/src

RUN pnpm run tsc && \
  chmod -R 777 /app/src/uploads && \
  chmod 777 /app/build/src/middlewares/

COPY ./src/views /app/build/src/views

USER chrome
# RUN chmod +x /app/uploads

ENTRYPOINT ["node", "/app/build/src/index.js"]
