'use strict';
const { node: GlobalsNode } = require('globals');
const TypeScriptParser = require('@typescript-eslint/parser');

const plugin = {
  rules: {
    'class-transformer-decorators-first': require('./rules/class-transformer-decorators-first'),
    'switch-case-padding': require('./rules/switch-case-padding'),
  },
};

const baseRules = {
  'constructor-super': 'error',
  'for-direction': 'error',
  'getter-return': 'error',
  'no-async-promise-executor': 'error',
  'no-case-declarations': 'error',
  'no-class-assign': 'error',
  'no-compare-neg-zero': 'error',
  'no-cond-assign': 'error',
  'no-const-assign': 'error',
  'no-constant-binary-expression': 'error',
  'no-constant-condition': 'error',
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-dupe-args': 'error',
  'no-dupe-class-members': 'error',
  'no-dupe-else-if': 'error',
  'no-dupe-keys': 'error',
  'no-duplicate-case': 'error',
  'no-empty': 'error',
  'no-empty-character-class': 'error',
  'no-empty-pattern': [
    'error',
    {
      allowObjectPatternsAsParameters: true,
    },
  ],
  'no-empty-static-block': 'error',
  'no-ex-assign': 'error',
  'no-extra-boolean-cast': 'error',
  'no-fallthrough': 'error',
  'no-func-assign': 'error',
  'no-global-assign': 'error',
  'no-import-assign': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-loss-of-precision': 'error',
  'no-misleading-character-class': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-nonoctal-decimal-escape': 'error',
  'no-obj-calls': 'error',
  'no-octal': 'error',
  'no-prototype-builtins': 'error',
  'no-redeclare': 'error',
  'no-regex-spaces': 'error',
  'no-self-assign': 'error',
  'no-setter-return': 'error',
  'no-shadow-restricted-names': 'error',
  'no-sparse-arrays': 'error',
  'no-this-before-super': 'error',
  'no-unused-vars': 'error',
  'no-unexpected-multiline': 'error',
  'no-unreachable': 'warn',
  'no-unsafe-finally': 'error',
  'no-unsafe-negation': 'error',
  'no-unsafe-optional-chaining': 'error',
  'no-unused-labels': 'error',
  'no-unused-private-class-members': 'error',
  'no-unused-vars': 'error',
  'no-useless-assignment': 'warn',
  'no-useless-backreference': 'error',
  'no-useless-catch': 'error',
  'no-useless-escape': 'error',
  'no-with': 'error',
  'require-yield': 'error',
  'use-isnan': 'error',
  'valid-typeof': 'error',
  'default-case': 'warn',

  'no-undef': 'off',

  'semi': 'error',
  'eol-last': 'error',
  'indent': ['error', 2, {
    SwitchCase: 1,
    VariableDeclarator: 1,
    outerIIFEBody: 1,
    FunctionDeclaration: {
      parameters: 1,
      body: 1
    },
    FunctionExpression: {
      parameters: 1,
      body: 1
    },
    CallExpression: {
      arguments: 1
    },
    ArrayExpression: 1,
    ObjectExpression: 1,
    ImportDeclaration: 1,
    flatTernaryExpressions: false,
    ignoredNodes: ['PropertyDefinition', 'FunctionExpression ObjectPattern'],
    ignoreComments: false
  }],
  
  'comma-spacing': [
    'error', {
    after: true,
  }],
  
  'no-array-constructor': 'off',
  'no-unused-vars': 'off',
  'no-unused-expressions': 'off',

  'prefer-const': ['error', {
    'destructuring': 'all',
  }],
  
  // The below changes are in order not to make changes that may broke something
  // in the future we need to change it to error
  'no-useless-escape': 'warn',
  'no-useless-catch': 'warn',
  
  'kysune/class-transformer-decorators-first': 'warn',
  'kysune/switch-case-padding': 'error',
};

/**
 * Generates an ESLint Flat Configuration based on the provided technology stack.
 * @param {('ts'|'typescript'|'vue')[]} stack - An array of strings defining the technologies used in the project.
 * @returns {Object} An ESLint configuration object containing namespaced rules, configs, and plugins.
 * @example
 * // eslint.config.js
 * const eslintConfig = require('@kysune/eslint-config');
 * module.exports = eslintConfig(['typescript', 'vue']);
 */
module.exports = (stack) => {
  if (!Array.isArray(stack)) stack = [];

  const result = [
    {
      ignores: [
        '.nuxt/**/*',
        'dist/**/*',
      ],
    },
    
    {
      languageOptions: {
        globals: {
          ...GlobalsNode,
        },
      },
    },
    
    {
      files: ['*.js', '**/*.js'],

      plugins: {
        'kysune': plugin,
      },
  
      rules: {
        ...baseRules,
      },
    },
  ];

  for (const tech of stack) {
    switch (tech) {
      case 'ts':
      case 'typescript': {
        result.push({
          files: ['*.ts', '**/*.ts'],
          
          languageOptions: {
            parser: TypeScriptParser,
          },

          plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            'kysune': plugin,
          },
      
          rules: {
            ...baseRules,
            'no-dupe-class-members': 'off',

            '@typescript-eslint/no-dupe-class-members': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            '@typescript-eslint/no-array-constructor': 'error',
            '@typescript-eslint/no-duplicate-enum-values': 'error',
            '@typescript-eslint/no-empty-object-type': 'error',
            '@typescript-eslint/no-extra-non-null-assertion': 'error',
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/no-namespace': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/no-this-alias': 'error',
            '@typescript-eslint/no-unnecessary-type-constraint': 'error',
            '@typescript-eslint/no-unsafe-declaration-merging': 'error',
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/prefer-namespace-keyword': 'error',
            '@typescript-eslint/triple-slash-reference': 'error',

            '@typescript-eslint/no-explicit-any': 'off',
          },
        });
        break;
      }
        
      case 'vue': {
        result.push({
          files: ['*.vue', '**/*.vue'],

          languageOptions: {
            parser: require('vue-eslint-parser'),
            parserOptions: {
              parser: TypeScriptParser,
            },
          },

          plugins: {
            'kysune': plugin,
          },

          rules: {
            ...baseRules,
          },
        });
        break;
      }
        
      default:
        throw new Error(`Unsupported technology "${tech}"`);
    }
  }
  
  return result;
};
