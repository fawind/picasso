module.exports = {
  extends: 'airbnb',
  globals: {
    XMLHttpRequest: true,
    FileReader: true,
    localStorage: true,
  },
  ecmaFeatures: {
    await: true,
  },
  rules: {
    'no-underscore-dangle': 0,
    'no-prototype-builtins': 0,
  },
};
