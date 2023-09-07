#!/usr/bin/env node
import { error } from 'console';
import enquirer from 'enquirer';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

(async function main() {
  try {
    const response = await enquirer.prompt({
      message: 'What is the URL of your GraphQL API?',
      name: 'URL',
      type: 'input',
    });

    fs.writeFileSync(
      `${moduleRoot}.config`,
      `CODEGEN_API_ENDPOINT=${response.URL}`
    );
  } catch (err) {
    error(err);
  }
})();
