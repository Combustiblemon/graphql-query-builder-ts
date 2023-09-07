#!/usr/bin/env node
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

(async function main() {
  if (process.argv.includes('--types_')) {
  }
  execSync('npm run types:update', { stdio: 'inherit' });
  execSync('npm run types:format', { stdio: 'inherit' });
  execSync('npm run build:code', { stdio: 'inherit' });
})();
