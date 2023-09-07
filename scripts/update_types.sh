#!/bin/bash
set -e

# save the command output to a variable
OUTPUT=$(node ./scripts/check_config.js)

if [[ $OUTPUT = *" "* ]]; then
  echo $OUTPUT
  exit 1
fi


CODEGEN_API_ENDPOINT=$OUTPUT npm run types:update
npm run types:format
npm run build:code
