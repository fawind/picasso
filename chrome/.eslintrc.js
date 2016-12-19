module.exports = {
  extends: 'airbnb',
  globals: {
    XMLHttpRequest: true,
    FileReader: true,
    localStorage: true,
    fetch: true,
    document: true,
  },
  ecmaFeatures: {
    await: true,
  },
  rules: {
    'no-underscore-dangle': 0,
    'no-prototype-builtins': 0,
    'class-methods-use-this': 0,
    'indent':  [
      'error',
      2,
      {
        'FunctionDeclaration': { 'parameters': 'first' },
      }
    ],
  },
};
