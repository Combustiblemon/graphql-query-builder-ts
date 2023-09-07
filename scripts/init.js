#!/usr/bin/env node
import { prompt } from 'enquirer';
import fs from 'fs';

(async function main() {
  const response = await prompt({
    message: 'What is the URL of your GraphQL API?',
    name: 'URL',
    type: 'input',
  });

  console.log(response.URL);
})();
