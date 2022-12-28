#!/app/bin/env bash

set -eo pipefail

echo PORT $PORT
echo ENV $NODE_ENV

if [ $NODE_ENV = 'test' ];
then
  exec node /app/build/src/seed/index.js &
  node /app/build/src/index.js

else  
exec node /app/build/src/index.js
fi

