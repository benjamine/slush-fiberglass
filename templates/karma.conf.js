module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha'],
    files: [
      'build/<%= package.name %>.js',
      'build/test-bundle.js'
    ],
    reporters : ['spec', 'growler']
  });
};
