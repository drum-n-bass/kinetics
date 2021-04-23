import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import json from '@rollup/plugin-json';

import pkg from './package.json';
const production = (process.env.BUILD == 'production');
const buildDir = production ? 'dist' : 'dev';
const transformBuildDir = str => str.replace('dist', buildDir);

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'Kinetics',
      file: transformBuildDir(pkg.browser),
      // sourcemap: true,
      format: 'umd',
      // globals: {
      //   rebound: 'rebound',
      // },
    },
    // external: ['rebound'],

    plugins: [
      resolve(), // so Rollup can find `dependencies`
      json(),
      commonjs({
        // namedExports: { 'rebound': [ 'rebound' ]}
        // namedExports: { 'js-sha3': [ 'keccak256' ]}
      }), // so Rollup can convert `ms` to an ES module
      babel({
        // plugins: ['external-helpers'],
        exclude: 'node_modules/**',
      }),
      production && terser(), // minify, but only in production
      !production && serve({
        open: false,
        openPage: `/${buildDir}/index.html`,
        contentBase: ".",
        host: "0.0.0.0", //"localhost",
        port: 3000
      }),
      !production && livereload(buildDir)
    ]
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
/*
  {
    input: 'src/index.js',
    output: [
      { file: transformBuildDir(pkg.main), format: 'cjs' },
      { file: transformBuildDir(pkg.module), format: 'es' }
    ],
    external: [ 'js-sha3' ]
  }
*/
];