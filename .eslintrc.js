module.exports = {
    root: true,
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true
    },
    globals: {
        'cordova': true,
        'Velocity': true,
        'DEV': true,
        'PROD': true,
        '__THEME': true
    },
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'standard',
    // required to lint *.vue files
    plugins: [
        'html'
    ],
    // add your custom rules here
    'rules': {
        // allow paren-less arrow functions
        'arrow-parens': 0,
        'one-var': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        // 'brace-style': [2, 'stroustrup', {
        //   'allowSingleLine': true
        // }],
        // allow async-await
        'generator-star-spacing': 0,
        //glen
        'semi': 0,
        'brace-style': 0,
        'indent': 0,
        'operator-linebreak': 0, // vscode editor does otherwise
        'no-unused-vars': 1,
        'comma-dangle': 0,
        'space-before-function-paren': 0,
        'quotes': 0,
        'no-multiple-empty-lines': 0,
        'spaced-comment': 0,

    }
};
