const config = {
  generates: {
    'src/types.ts': {
      config: {
        enumsAsTypes: true,
        skipTypename: true,
        typesSuffix: 'Type',
      },
      plugins: ['typescript'],
    },
  },
  overwrite: true,
  schema: {
    [process.env.CODEGEN_API_ENDPOINT]: {
      headers: {
        appid: 'codegen',
      },
    },
  },
};

module.exports = config;
