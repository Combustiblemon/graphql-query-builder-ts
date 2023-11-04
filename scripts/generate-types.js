#!/usr/bin/env node
/* eslint-disable no-octal-escape */
import { promises as fs } from 'fs';
import { clearLine, cursorTo } from 'readline';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleRoot = `${__dirname}/../`;

const readFile = `${moduleRoot}src/generatedTypes.ts`;
const writeFile = `${moduleRoot}dist/index.d.ts`;

console.log(moduleRoot);

// const fileTop = `/* eslint-disable prettier/prettier */
// /* eslint-disable @typescript-eslint/ban-types */
// /* eslint-disable sort-keys-fix/sort-keys-fix */
// /* eslint-disable no-use-before-define */
// /* eslint-disable typescript-sort-keys/interface */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /*
// * This file is auto-generated, any changes made will be lost.
// */
// `;

const yellow = '\x1b[1;33m';
const green = '\x1b[1;32m';
const noColor = '\x1b[0m';

const updateTypes = (data) => {
  const args = data
    // split the file into lines
    .split('\n')
    // filter out lines that don't include the word "Args"
    .filter((line) => line.includes('Args'))
    // split the line into words and return the third word (the name of the type)
    .map((line) => line.split(' ')[2]);

  const queryArgs = args
    // filter out lines that don't include the word "Query"
    .filter((arg) => arg.includes('Query'))
    // map the lines to the correct format
    .map((arg) => {
      const temp = arg.replace('Query', '').replace('ArgsType', '');
      return `${temp.charAt(0).toLowerCase() + temp.slice(1)}: ${arg}`;
    });

  const mutationArgs = args
    // filter out lines that don't include the word "Mutation"
    .filter((arg) => arg.includes('Mutation'))
    // map the lines to the correct format
    .map((arg) => {
      const temp = arg.replace('Mutation', '').replace('ArgsType', '');
      return `${temp.charAt(0).toLowerCase() + temp.slice(1)}: ${arg}`;
    });

  const variables = data
    // split the file into lines
    .split('export type ')
    // filter out lines that don't include the word "ArgsType"
    .filter((line) => line.includes('ArgsType'))
    .map((type) =>
      type
        // split the type into lines
        .split('\n')
        // remove the last 2 lines of the type (the closing bracket and the newline)
        .slice(0, -2)
        // map the lines to the correct format
        .reduce((acc, line, index) => {
          // the first line is the name of the type
          if (index === 0) {
            const typeName = line
              // remove the last 4 characters of the type name to clean up ' = {'
              .substring(0, line.length - 4)
              // remove the word 'Mutation' from the type name
              .replace('Mutation', '')
              // remove the word 'Query' from the type name
              .replace('Query', '')
              // remove the word 'ArgsType' from the type name
              .replace('ArgsType', '');
            // make the first letter of the type name lowercase
            return [`${typeName[0]?.toLowerCase()}${typeName.slice(1)}`];
          }

          // check if the type is an array
          const isArray = line.includes('Array');

          // the rest of the lines are the variables in the type definition (e.g. id: Scalars['ID']) so we need to extract the types
          // from the line
          const variable = line
            .match(
              // this regex matches the following:
              // 1. variable names (e.g. _id)
              // 2. types that aren't InputMaybe (e.g. Scalars['ObjectID'])
              // 3. types that are InputMaybe (e.g. InputMaybe<Scalars['Int']>)
              /([a-z?A-z0-9_]*:)|((?!.*\bInputMaybe<\b)(?<=<).*?(?=>))|(?<=Scalars\[').*?(?='\])/g
            )
            ?.map((v) => {
              // extract the type or the parameter from the line and remove the 'Array' from the type if it's an array
              // e.g. Scalars['ObjectID'] => ObjectID
              // e.g. Array<Scalars['ObjectID']> => [ObjectID]
              // e.g. Array<InputMaybe<Scalars['ObjectID']>> => [ObjectID]
              // e.g. Array<ProductType> => [ProductType]
              let result = v.includes('Scalars')
                ? v.match(/(?<=Scalars\[').*?(?='\])/g).join('')
                : v;

              const isParameter = result.includes(':');

              // if the variable is a parameter, add a dollar sign to the start
              if (isParameter) {
                result = `${result} {\n`;
              } else {
                result = `     type: '${result}',\n`;
              }

              // if the variable is an array and not a parameter
              if (!isParameter) {
                result += `      isArray: ${isArray},\n`;
              }

              return result;
            })
            .join(' ');

          let result = acc;
          // if the variable is not empty, add it to the array
          if (variable) {
            const isRequired = !variable.includes('?');
            // remove the question mark from the variable name, if the variable is
            // mandatory add an exclamation mark to the end
            result = [
              ...acc,
              `    ${variable.replace(
                '?',
                ''
              )}      isRequired: ${isRequired},\n    }`,
            ];
          }

          return result;
        }, [])
    )
    .map((v) => `${v[0]}: {\n${v.slice(1).join(',\n')}\n  }`);

  return `${data
    .replace(' ObjectID: any;', ' ObjectID: string;')
    .replace(' DateTime: any;', ' DateTime: string;')
    .replace(' Date: any;', ' Date: string;')}
export type QueryArgsType = {
  ${queryArgs.join(',\n  ')}
}

export type MutationArgsType = {
  ${mutationArgs.join(',\n  ')}
}

export type ArgsType = QueryArgsType & MutationArgsType\n

export const operationVariables = {\n ${variables.join(
    ',\n  '
  )}\n} as const;\n`;
};

const createTypes = () => {
  return `export type QueryType = {}
export type MutationType = {}
export type ArgsType = QueryType & MutationType
export const operationVariables = {} as const;
  `;
};

async function getWriteData() {
  const writeData = await fs.readFile(writeFile, 'utf-8');
  return 'type SOF = string;\n' + writeData.split('type SOF = string;\n')[1];
}

const formatFiles = async () => {
  process.stdout.write(`${yellow}❯${noColor} Updating graphql types...`);

  const readData = await fs.readFile(readFile, 'utf-8');
  const writeData = await getWriteData();

  if (readData) {
    const file = updateTypes(readData);

    await fs.writeFile(writeFile, file + writeData);

    clearLine(process.stdout);
    cursorTo(process.stdout, 0);
    process.stdout.write(`${green}✔${noColor} Types updated\n`);
  } else {
    const file = createTypes();

    await fs.writeFile(writeFile, file + writeData);

    clearLine(process.stdout);
    cursorTo(process.stdout, 0);
    process.stdout.write(
      `${yellow}✔${noColor} Type file not found, placeholder types created\n`
    );
  }
};

formatFiles();
