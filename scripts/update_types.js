#!/usr/bin/env node
import { execSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './loadConfig.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

try {
  // skip loading the config if the CODEGEN_API_ENDPOINT and CODEGEN_API_HEADERS are already set
  let config;
  if (process.env.CODEGEN_API_ENDPOINT || process.env.CODEGEN_API_HEADERS) {
    config = {
      CODEGEN_API_ENDPOINT: process.env.CODEGEN_API_ENDPOINT,
      CODEGEN_API_HEADERS: JSON.parse(process.env.CODEGEN_API_HEADERS),
    };
  } else {
    // get the config file contents
    config = loadConfig();
  }

  // Check if the output contains a space
  if (!config || config.CODEGEN_API_ENDPOINT.includes(' ')) {
    console.log(config);
    process.exit(1);
  }

  // Set the CODEGEN_API_ENDPOINT variable and run the npm commands
  process.env.CODEGEN_API_ENDPOINT = config.CODEGEN_API_ENDPOINT;
  process.env.CODEGEN_API_HEADERS = JSON.stringify(config.CODEGEN_API_HEADERS);
  execSync(`cd ${moduleRoot} && npm run types:update`, {
    stdio: 'inherit',
    env: process.env,
  });
  execSync(`cd ${moduleRoot} && npm run types:format`, {
    stdio: 'inherit',
    env: process.env,
  });
  execSync(`cd ${moduleRoot} && npm run build:code`, {
    stdio: 'inherit',
    env: process.env,
  });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
