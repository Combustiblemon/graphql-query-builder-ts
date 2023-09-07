#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');

const helpMessage = `
You did not pass any options. Try one of the following:

Options:
  --init          Create a codegen config file
  --check-config  Check for a codegen config file
  --update        Update the generated types
  -h, --help      Print this message
`;

// if --init is passed, run the init script
if (process.argv.includes('--init')) {
  require('../scripts/init');
  process.exit(0);
}

// if --check-config is passed, run the check_config script
if (process.argv.includes('--check-config')) {
  require('../scripts/check_config');
  process.exit(0);
}

// if --update is passed, run the update_types script
if (process.argv.includes('--update')) {
  execSync('../scripts/update_types.sh');
  process.exit(0);
}

// if -h or --help is passed, print a help message
if (process.argv.includes('-h') || process.argv.includes('--help')) {
  console.log(helpMessage);
  process.exit(0);
}

// if no options are passed, print a help message
console.log(helpMessage);
