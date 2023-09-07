#!/usr/bin/env node
/* eslint-disable no-console */
import { execSync } from 'child_process';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

const helpMessage = `
You did not pass any options. Try one of the following:

Options:
  --init          Create a codegen config file
  --check-config  Check for a codegen config file
  --update        Update the generated types
  -h, --help      Print this message
`;
(async function main() {
  // if --init is passed, run the init script
  if (process.argv.includes('--init')) {
    execSync(`node ${moduleRoot}scripts/init.js`, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    return;
  }

  // if --check-config is passed, run the check_config script
  if (process.argv.includes('--check-config')) {
    execSync(`node ${moduleRoot}scripts/check_config.js`, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    return;
  }

  // if --update is passed, run the update_types script
  if (process.argv.includes('--update')) {
    execSync(`node ${moduleRoot}scripts/update_types.js`, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    return;
  }

  // if -h or --help is passed, print a help message
  if (process.argv.includes('-h') || process.argv.includes('--help')) {
    console.log(helpMessage);
    return;
  }

  // if no options are passed, print a help message
  console.log(helpMessage);
})();
