#!/app/bin/env bash

set -eo pipefail

echo PORT $PORT
echo ENV $NODE_ENV

FREE=$(free -m);
echo "FREE: ${FREE}"
FREE_FINAL=$(echo "$FREE" | grep -F Mem:  | grep -o "[0-9]*" | grep -o -m1 "^[0-9]*")
echo "FREE_FINAL: ${FREE_FINAL}"
MEM_LIMIT=$(($FREE_FINAL-400))
echo "MEM_LIMIT: ${MEM_LIMIT}"
echo " - "

export MEMORY_LIMIT="${MEM_LIMIT:=3500}";

export NODE_OPTIONS="--max-old-space-size=${MEMORY_LIMIT}"
echo "NODE_OPTIONS: ${NODE_OPTIONS}"

exec node /app/build/src/index.js --max-old-space-size=${MEMORY_LIMIT}

