FROM node:16

RUN mkdir /app
WORKDIR /app

COPY package.json /app/

RUN npm install

# Be careful with this env variable
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-dev}

COPY .env /app/.env
COPY ormconfig-docker.json /app/ormconfig.json
COPY tsconfig.json /app/
COPY entrypoint.sh /app/
COPY Heroku.yml /app/
COPY ./src /app/src

RUN npm run tsc
# CMD ["npm", "run", "build"]
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/bin/bash","/app/entrypoint.sh"]
# CMD ["/bin/bash", "/app/entrypoint.sh"]
