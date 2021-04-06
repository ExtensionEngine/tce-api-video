'use strict';

const path = require('path');

/** @type {import('bili').Config} */
module.exports = {
  input: {
    'tce-api-video': 'src/index.js'
  },
  output: {
    format: ['cjs', 'es', 'umd', 'umd-min'],
    moduleName: 'TceApiVideo'
  },
  bundleNodeModules: ['rollup-plugin-vue', 'vue-runtime-helpers'],
  plugins: {
    vue: true,
    'tailor-ce': true,
    postcss: {
      extract: 'tce-api-video.css'
    },
    babel: {
      sourceMap: true,
      extensions: ['.js', '.vue']
    },
    alias: {
      resolve: ['.vue', '.js'],
      entries: [{ find: '@', replacement: path.join(__dirname, './src') }]
    },
    copy: {
      targets: [
        { src: 'src/server', dest: 'dist' },
        { src: 'src/shared', dest: 'dist' }
      ]
    }
  },
  resolvePlugins: {
    alias: require('@rollup/plugin-alias'),
    'tailor-ce': require('@extensionengine/rollup-plugin-tailor-ce')
  }
};
