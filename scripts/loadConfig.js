#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import appRoot from 'app-root-path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

const YELLOW = '\x1b[1;33m';
const GREEN = '\x1b[1;32m';
const NO_COLOR = '\x1b[0m';
const RED = '\x1b[1;31m';

function error() {
  console.log(
    `${RED}The package has not been initialized. Please run ${YELLOW} npm exec graphql-query-builder-ts -- --init ${NO_COLOR}`
  );
}

function fileError() {
  console.log(
    `${RED}There was an error reading file ${YELLOW}${appRoot}/gql-query-builder-config.json${RED}. Please check the file and try again.${NO_COLOR}`
  );
}

/**
 * Check if the .config file exists and if it does, check if it contains CODEGEN_API_ENDPOINT and CODEGEN_API_HEADERS
 * @returns {string} - the contents of the .config file
 */
async function loadConfig() {
  // check if the .config file exists
  if (existsSync(`${appRoot}/gql-query-builder-config.json`)) {
    let data;
    try {
      data = JSON.parse(
        readFileSync(`${appRoot}/gql-query-builder-config.json`, 'utf8')
      );
    } catch (err) {
      fileError();
      if (process.env.DEBUG) console.error(err);

      process.exit(1);
    }

    if (data) {
      return data;
    } else {
      fileError();
      process.exit(1);
    }
  } else {
    error();
    return;
  }
}

export { loadConfig };
