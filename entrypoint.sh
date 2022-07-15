#!/app/bin/env bash

echo PORT $PORT
exec node /app/build/index.js &
node /app/build/jobs.js

