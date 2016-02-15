
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var childProcess = require('child_process');
var install = require('gulp-install');
var conflict = require('gulp-conflict');
var template = require('gulp-template');
var rename = require('gulp-rename');
var gulpif = require('gulp-if');
var _ = require('lodash');
var _s = require('underscore.string');
var inquirer = require('inquirer');
var gulpPatch = require('./gulp-patch');
var gulpIfNotFound = require('./gulp-ifnotfound');

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

function getValidPackageInfo() {
  if (!fs.existsSync('./package.json')) {
    childProcess.execSync('npm init', { stdio: 'inherit' });
  }
  var packageInfo = JSON.parse(fs.readFileSync('./package.json').toString());
  if (!packageInfo.author) {
    throw new Error('package.json must specify "author"');
  }
  if (!packageInfo.repository) {
    throw new Error('package.json must specify "repository"');
  }
  return packageInfo;
}

gulp.task('default', function(done) {
  var packageInfo;
  try {
    packageInfo = getValidPackageInfo();
  } catch (err) {
    done(err);
  }

  var prompts = [{
    type: 'confirm',
    name: 'moveon',
    message: 'scaffold module "' + packageInfo.name + '"?'
  }];
  inquirer.prompt(prompts,
    function(answers) {
      if (!answers.moveon) {
        return done();
      }

      var data = answers;
      data.package = packageInfo;
      data.camelName = _s.camelize(packageInfo.name);
      data.githubRepo = 'owner/reponame';
      if (packageInfo.repository) {
        if (packageInfo.repository.url && /github.com\/.+\.git$/.test(packageInfo.repository.url)) {
          data.githubRepo = /github.com\/(.+)\.git$/.exec(packageInfo.repository.url)[1];
        } else if (/^[^:]+\/[^:]+$/.test(packageInfo.repository)) {
          data.githubRepo = packageInfo.repository;
        }
      }

      data.include = function(filepath) {
        var contents = fs.readFileSync(path.join(__dirname, 'templates', filepath)).toString();
        return _.template(contents)(data);
      };

      var srcFiles = [path.join(__dirname, 'templates', '**')];
      gulp.src(srcFiles)
        .pipe(rename(function(file) {
          if (file.basename[0] === '_') {
            // rename _filename.ext => .filename.ext (can't use dotfiles in templates dir)
            file.basename = '.' + file.basename.slice(1);
          }
        }))
        .pipe(gulpIfNotFound('./'))
        .pipe(gulpPatch('./', data))
        .pipe(gulpif(isTemplateFile, template(data, {
          // use only <%= name %> syntax, disabling ES6 interpolate
          interpolate: /<%=([\s\S]+?)%>/g
        })))
        .pipe(conflict('./'))
        .pipe(gulp.dest('./'))
        .pipe(install())
        .on('end', function() {
          done();
        });
    });
});
