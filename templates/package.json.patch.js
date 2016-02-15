module.exports = function(current, util) {
  return util.packageJson.patch(current, {
    license: 'MIT'
  }, {
    scripts: {
      check: 'npm-check && nsp check',
      checku: 'npm-check -u && nsp check',
      preversion: 'npm test && npm run check',
      postversion: 'git push && git push --tags && fiberglass publish',
      test: 'make -s && eslint src test && mocha',
      watch: 'make -s && nodemon --exec "npm test"',
      cover: 'istanbul cover --root src _mocha',
      'cover-report': 'open coverage/lcov-report/index.html',
      'cover-publish': 'istanbul cover _mocha --report lcovonly && codeclimate < coverage/lcov.info'
    },
    main: './src/main',
    devDependencies: {
      'codeclimate-test-reporter': '^0.3.1',
      eslint: '^2.2.0',
      'eslint-config-standard': '^5.1.0',
      'eslint-plugin-promise': '^1.0.8',
      'eslint-plugin-standard': '^1.3.2',
      'expect.js': '~0.3.1',
      fiberglass: '^0.1.0',
      istanbul: '^0.4.2',
      mocha: '^2.3.3',
      'mocha-lcov-reporter': '^1.1.0',
      nodemon: '^1.9.0',
      'npm-check': 'latest',
      'nsp': 'latest'
    }
  });
};
