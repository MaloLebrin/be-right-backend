[![🔖 Create Release](https://github.com/MaloLebrin/be-right-backend/actions/workflows/release.yml/badge.svg)](https://github.com/MaloLebrin/be-right-backend/actions/workflows/release.yml)
# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command


## seed local DB

1. Build the containers `docker-compose build`
2. Run container detach mode `docker-composer up -d`
3. Enter in container `docker exec -it <container-id> bash`
4. Run scriptSeed.sh
