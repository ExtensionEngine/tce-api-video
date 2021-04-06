'use strict';

module.exports = {
  root: true,
  extends: '@extensionengine',
  rules: {
    'vue/component-definition-name-casing': ['error', 'kebab-case']
  },
  overrides: [{
    files: ['src/**'],
    excludedFiles: 'src/server/**',
    parserOptions: {
      parser: '@babel/eslint-parser',
      sourceType: 'module'
    }
  }]
};
