import typescript from 'rollup-plugin-typescript2';
import pkg from '../package.json';
import { terser } from 'rollup-plugin-terser';

// delete old typings to avoid issues
require('fs').unlink('dist/index.d.ts', (err) => { });

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfigDefaults: {
          compilerOptions: {
            target: 'ES5',
            declaration: true,
          },
          include: [
            'src'
          ]
        },
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: `dist/${pkg.name}.min.js`,
        format: 'cjs',
      },
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfigDefaults: {
          target: 'ES5',
          include: [
            'src'
          ]
        },
      }),
      terser({
        module: true,
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'esm',
      },
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfigDefaults: {
          compilerOptions: {
            target: 'ESNEXT',
          },
          include: [
            'src'
          ]
        },
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: `dist/${pkg.name}.es.min.js`,
        format: 'esm'
      },
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfigDefaults: {
          target: 'ESNEXT',
          include: [
            'src'
          ]
        },
      }),
      terser({
        module: true,
      }),
    ],
  },
];
