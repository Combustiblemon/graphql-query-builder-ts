import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: [
    `${process.env.GQL_MODULE_ROOT}src/index.tsx`,
  ],
  dts: true,
  outDir: `${process.env.GQL_MODULE_ROOT}dist`,
  format: ['esm', 'cjs'],
  name: 'graphql-query-builder-ts',
  splitting: false,
  sourcemap: false,
  clean: true,
  target: "es2016",
  minify: false,
}));
