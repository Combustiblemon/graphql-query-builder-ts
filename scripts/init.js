#!/usr/bin/env node
import enquirer from 'enquirer';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

(async function main() {
  const response = await enquirer.prompt({
    message: 'What is the URL of your GraphQL API?',
    name: 'URL',
    type: 'input',
  });

  fs.writeFileSync(
    `${moduleRoot}.config`,
    `CODEGEN_API_ENDPOINT=${response.URL}`
  );
})();
