module.exports = {
  env: {
    es2021: true,
    node  : true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser       : '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType : 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {

    /**
     * インデント
     * 
     * @description インデントはスペース２つ。switch-case文はインデントをする
     */
    'indent'         : ['error', 2, { 'SwitchCase': 1 }],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],

    /**
     * Type定義のメンバの分割はセミコロンにする
     * @see https://typescript-eslint.io/rules/member-delimiter-style/
     */
    '@typescript-eslint/member-delimiter-style': 'error',

    /**
     * ブレースの内側にはスペースを入れる
     * @see https://eslint.org/docs/latest/rules/object-curly-spacing
     */
    'object-curly-spacing': ['error', 'always'],

    /**
     * no space inside parentheses
     * @see https://eslint.org/docs/latest/rules/space-in-parens
     */
    'space-in-parens': ['error', 'never'],

    /**
     * 関数の返却型を明示する
     * @see https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/explicit-function-return-type.md
     *
     * @description
     * allowExpressions: true の場合、宣言の一部である関数だけがチェックされます。
     */
    '@typescript-eslint/explicit-function-return-type': ['error', {
      'allowExpressions': true
    }],

    /**
     * Disallow renaming import, export, and destructured assignments to the same name
     * @see https://eslint.org/docs/latest/rules/no-useless-rename
     */
    'no-useless-rename'                         : 'error',
    '@typescript-eslint/type-annotation-spacing': ['error', {
      'before'   : false,
      'after'    : true,
      'overrides': {
        'arrow': { 'before': true, 'after': true }
      }
    }],

    // "import React from 'react'"なしでもエラーが出ないようにする
    'react/react-in-jsx-scope': 'off',

    /**
     * コメントの前に空行をいれる
     * @see https://eslint.org/docs/rules/lines-around-comment#require-empty-lines-around-comments-lines-around-comment
     * @fix
     *
     * @description
     * beforeBlockComment : ブロックコメントの前に空行を入れる
     * afterBlockComment  : ブロックコメントの後に空行を入れない
     * beforeLineComment  : 行コメントの前に空行を入れる
     * afterLineComment   : 行コメントの前に空行を入れない
     * allowClassStart    : クラスの開始直後の行は空行を入れる
     */
    'lines-around-comment': [
      'error',
      {
        beforeBlockComment: true,
        afterBlockComment : false,
        beforeLineComment : true,
        afterLineComment  : false,
        allowClassStart   : false
      }
    ],

    /**
     * コメントの最初にはスペースを入れる
     * @see https://eslint.org/docs/rules/spaced-comment#requires-or-disallows-a-whitespace-space-or-tab-beginning-a-comment-spaced-comment
     * @fix
     */
    'spaced-comment': ['error', 'always', { block: { exceptions: ['*'] } }],

    /**
     * ヨーダ記法を使用しない
     * @see https://eslint.org/docs/rules/yoda#require-or-disallow-yoda-conditions-yoda
     * @fix
     *
     * @description
     * exceptRange: 範囲を示す時はヨーダ記法を使用していい
     */
    yoda: ['error', 'never', { exceptRange: true }],

    /**
     * 連続する空行は１行までとする
     * @see https://eslint.org/docs/rules/no-multiple-empty-lines#disallow-multiple-empty-lines-no-multiple-empty-lines
     * @fix
    */
    'no-multiple-empty-lines': ['error', { max: 1 }],

    /**
     * オブジェクト要素のキーとバリューの間にスペースをいれるか
     * @see https://eslint.org/docs/rules/key-spacing#enforce-consistent-spacing-between-keys-and-values-in-object-literal-properties-key-spacing
     * @fix
     *
     * @description
     * beforeColon  : コロンの前にスペースは入れない
     * afterColon   : コロンの後にスペースを入れる
     * align        : 複数行にわたるときにコロンを立てにそろえる
     */
    'key-spacing': [
      'error',
      {
        beforeColon: false,
        afterColon : true,
        align      : 'colon'
      }
    ],

    /**
     * 命名規則
     * @see https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md
     */
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format  : ['PascalCase'],
        custom  : {
          regex: '^I[A-Z]',
          match: true
        }
      },
      {
        selector: 'class',
        format  : ['PascalCase']
      },
      {
        selector: 'typeAlias',
        format  : ['PascalCase']
      },
      {
        selector: 'function',
        format  : ['camelCase']
      },
      {
        selector: 'method',
        format  : ['camelCase']
      },
      {
        selector: 'variable',
        format  : ['camelCase', 'PascalCase', 'snake_case']
      },
      {
        selector: 'parameterProperty',
        format  : ['camelCase']
      },
      {
        selector         : 'property',
        format           : ['camelCase', 'PascalCase'],
        leadingUnderscore: 'allow'
      },
      {
        selector: 'parameter',
        format  : ['camelCase']
      },
      {
        selector: 'typeParameter',
        format  : ['PascalCase'],
        prefix  : ['T', 'U', 'K', 'P', 'E']
      }
    ],

    /**
     * キーワードの前後にスペースを入れるか
     * @see https://eslint.org/docs/rules/keyword-spacing#enforce-consistent-spacing-before-and-after-keywords-keyword-spacing
     * @fix
     *
     * @description
     * before           : キーワードの前にスペースを入れる
     * after            : キーワードの後にスペースを入れる
     * overrides.if     : ifキーワードの後にはスペースを入れない
     * overrides.for    : forキーワードの後にはスペースを入れない
     * overrides.while  : whileキーワードの後にはスペースを入れない
     * overrides.switch : switchキーワードの後にはスペースを入れない
     */
    'keyword-spacing': ['error', { before: true, after: true, overrides: { if: { after: false }, for: { after: false }, while: { after: false }, switch: { after: false } } }],

    /**
     * switchのcase句でブロックを利用せずに変数や関数を定義するするのを禁止
     * @see https://eslint.org/docs/rules/no-case-declarations#disallow-lexical-declarations-in-casedefault-clauses-no-case-declarations
     */
    'no-case-declarations': 'error',

    /**
     * case句でフォールスルーを禁止する
     * @see https://eslint.org/docs/rules/no-fallthrough#disallow-case-statement-fallthrough-no-fallthrough
     *
     * @description
     * ただし、次の時はフォールスルーを許可する
     *
     * ex.1
     * switch(1) {
     * case1:
     * case2:
     *   break;
     * }
     *
     * ex.2
     * switch(1) {
     * case1:
     *   XXX();
     *   // falls through
     * case2:
     *   break;
     * }
     */
    'no-fallthrough': 'error',
  },
  overrides: [
    {
      files: '*.js',
      rules: {
        '@typescript-eslint/naming-convention': 'off'
      }
    }
  ]
};
