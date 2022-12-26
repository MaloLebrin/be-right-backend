#!/app/bin/env bash

echo PORT $PORT
echo ENV $NODE_ENV
exec node /app/build/src/index.js
# & node /app/build/src/jobs.js

