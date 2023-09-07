#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

const YELLOW = '\x1b[1;33m';
const GREEN = '\x1b[1;32m';
const NO_COLOR = '\x1b[0m';

function error() {
  console.log(
    `The package has not been initialized. Please run ${YELLOW} npm exec gql-query-builder-ts --init ${NO_COLOR}`
  );
}

(async function main() {
  // check if the .config file exists
  if (existsSync(`${moduleRoot}.config`)) {
    const data = readFileSync(`${moduleRoot}.config`, 'utf8');

    // if CODEGEN_API_ENDPOINT exists write it to the codegen.json file
    if (data.includes('CODEGEN_API_ENDPOINT')) {
      const schema = data.split('=')[1].trim();
      console.log(schema);
      process.exit(0);
    } else {
      error();
      return;
    }
  }

  // if neither codegen.js or codegen.json exist exit with an error
  error();
})();
