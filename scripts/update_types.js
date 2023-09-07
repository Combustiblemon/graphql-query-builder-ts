#!/usr/bin/env node

// #!/bin/bash
// set -e

// # save the command output to a variable
// OUTPUT=$(node ./scripts/check_config.js)

// if [[ $OUTPUT = *" "* ]]; then
//   echo $OUTPUT
//   exit 1
// fi

// CODEGEN_API_ENDPOINT=$OUTPUT npm run types:update
// npm run types:format
// npm run build:code

import { execSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

try {
  // Execute the command and capture its output
  const OUTPUT = execSync(`node ${moduleRoot}scripts/check_config.js`, {
    encoding: 'utf-8',
  });

  // Check if the output contains a space
  if (OUTPUT.includes(' ')) {
    console.log(OUTPUT);
    process.exit(1);
  }

  // Set the CODEGEN_API_ENDPOINT variable and run the npm commands
  process.env.CODEGEN_API_ENDPOINT = OUTPUT;
  execSync(`cd ${moduleRoot} && npm run types:update`, { stdio: 'inherit' });
  execSync(`cd ${moduleRoot} && npm run types:format`, { stdio: 'inherit' });
  execSync(`cd ${moduleRoot} && npm run build:code`, { stdio: 'inherit' });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
