'use strict';

module.exports = {
  root: true,
  extends: '@extensionengine',
  rules: {
    'vue/comment-directive': 'off',
    'vue/component-definition-name-casing': ['error', 'kebab-case']
  },
  overrides: [{
    files: ['src/**'],
    parserOptions: {
      parser: '@babel/eslint-parser',
      sourceType: 'module'
    }
  }]
};
