/*
 * slush-fiberglass
 * https://github.com/benjamine/slush-fiberglass
 *
 * Copyright (c) 2014, Benjamin Eidelman
 * Licensed under the MIT license.
 */

var fs = require('fs'),
    gulp = require('gulp'),
    path = require('path'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    gulpif = require('gulp-if'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    gulpJsonCombine = require('./gulp-jsoncombine');

var binaryFileExtensions = [
  '.so',
  '.png', '.jpg', '.gif',
  '.wav', '.mp3', '.mpg', '.3gp',
  '.zip', '.tgz', '.bz2', '.gz'
];

function isTemplateFile(f) {
  // don't treat binary files as templates
  var ext = path.extname(f.name).toLowerCase();
  return binaryFileExtensions.indexOf(ext) < 0;
}

gulp.task('default', function (done) {
  var packageInfo;
  var likelyBrowserSupport = false;
  try {
    var packageInfoContents = fs.readFileSync('./package.json').toString();
    likelyBrowserSupport = /browser/gi.test(packageInfoContents);
    packageInfo = JSON.parse(packageInfoContents);
  } catch (err) {
    done(new Error('unable to load package.json, try: npm init'));
    return;
  }

  var prompts = [{
    type: 'confirm',
    name: 'browser',
    message: 'Browser support?',
    default: likelyBrowserSupport
  }, {
    type: 'confirm',
    name: 'moveon',
    message: 'Create js library ' + packageInfo.name + '?'
  }];
  inquirer.prompt(prompts,
    function (answers) {
      if (!answers.moveon) {
        return done();
      }

      answers.package = packageInfo;
      answers.camelName = _.camelize(packageInfo.name);
      answers.githubRepo = 'owner/reponame';
      if (packageInfo.repository && packageInfo.repository.url &&
        /github.com\/.+\.git$/.test(packageInfo.repository.url)) {
        answers.githubRepo = /github.com\/(.+)\.git$/.exec(packageInfo.repository.url)[1];
      }

      var srcFiles = [__dirname + '/templates/**'];
      var browserOnlyFilter = __dirname + '/templates/.browser-only';
      if (!answers.browser && fs.existsSync(browserOnlyFilter)) {
        fs.readFileSync(browserOnlyFilter).toString()
          .split('\n').forEach(function(name){
              srcFiles.push('!' + __dirname + '/templates/' + name);
          });
      }
      gulp.src(srcFiles)
        .pipe(gulpif(isTemplateFile, template(answers, {
          // use only <%= name %> syntax, disabling ES6 interpolate
          interpolate: /<%=([\s\S]+?)%>/g
        })))
        .pipe(rename(function (file) {
          if (file.basename[0] === '_') {
            // rename _filename.ext => .filename.ext (can't use dotfiles in templates dir)
            file.basename = '.' + file.basename.slice(1);
          }
        }))
        .pipe(gulpJsonCombine('./'))
        .pipe(conflict('./'))
        .pipe(gulp.dest('./'))
        .pipe(install())
        .on('end', function () {
          done();
        });
    });
});
