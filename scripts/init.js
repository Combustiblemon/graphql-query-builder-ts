#!/usr/bin/env node
import { execSync } from 'child_process';
import { error, log } from 'console';
import enquirer from 'enquirer';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import appRoot from 'app-root-path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

(async function main() {
  try {
    const response = await enquirer.prompt({
      message: 'What is the URL of your GraphQL API?',
      name: 'URL',
      type: 'input',
    });

    const wantHeaders = await enquirer.prompt({
      message: 'Do you want to add headers?',
      type: 'confirm',
    });
    let headers = {};

    if (wantHeaders) {
      const headerNumber = await enquirer.prompt({
        message: 'Please enter the number of headers you want to add',
        name: 'number',
        type: 'numeral',
      });

      for (let i = 0; i < headerNumber.number; i++) {
        const header = await enquirer.prompt({
          message: `Please enter the key of header ${i + 1}`,
          type: 'input',
          name: 'name',
        });
        const value = await enquirer.prompt({
          message: `Please enter the value of ${header.name}`,
          type: 'input',
          name: 'value',
        });
        headers[header.name] = value.value;
      }
    }

    fs.writeFileSync(
      `${appRoot}/gql-query-builder-config.json`,
      JSON.stringify({
        CODEGEN_API_ENDPOINT: response.URL,
        CODEGEN_API_HEADERS: headers,
      })
    );
    console.log('Initializing...');

    execSync(`node ${moduleRoot}scripts/update_types.js`, {
      stdio: 'inherit',
      encoding: 'utf-8',
      env: {
        ...process.env,
        CODEGEN_API_ENDPOINT: response.URL,
        CODEGEN_API_HEADERS: JSON.stringify(headers),
      },
    });
  } catch (err) {
    error(err);
  }
})();
