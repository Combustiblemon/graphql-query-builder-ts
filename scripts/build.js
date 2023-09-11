#!/usr/bin/env node
import { execSync } from 'child_process';
import { error } from 'console';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

(async function main() {
  try {
    process.env.GQL_MODULE_ROOT = moduleRoot;

    execSync(
      `rm -rf ${moduleRoot}dist && npm exec tsup ${moduleRoot}src/index.ts --config=${moduleRoot}tsup.config.ts`,
      {
        stdio: 'inherit',
        encoding: 'utf-8',
      }
    );
  } catch (err) {
    error(err);
  }
})();
