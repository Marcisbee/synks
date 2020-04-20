import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

// delete old typings to avoid issues
require('fs').unlink('dist/index.d.ts', (err) => { });

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'es'
      }
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: `dist/${pkg.name}.min.js`,
        format: 'cjs'
      },
      {
        file: `dist/${pkg.name}.es.min.js`,
        format: 'es'
      }
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
      terser(),
    ],
  },
];
