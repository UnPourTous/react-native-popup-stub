const gulp = require('gulp')
const chalk = require('chalk')
const shell = require('gulp-shell')
const execSync = require('child_process').execSync;
const libPackageInfo = require('./lib/package.json')
const envVersion = require('./package.json').envVersion
const compare = require('node-version-compare');

gulp.task('check:node', () => {
  const checkCmdExisted = execSync('if ! [ -x "$(command -v node)" ]; then echo "0"; else echo "-1"; fi')
  if (!checkCmdExisted.toString() === '-1') {
    console.log('nodejs not installed')
    process.exit()
  }
  const version = execSync('node --version | cut -d " " -f 3 | sed -e "s/[ |v]//g"')
  const versionStr = version.toString()
  if (compare(versionStr, envVersion.nodejs.min) < 0) {
    console.warn('nodejs should be at least ' + envVersion.nodejs.min + ', current ' + versionStr)
    process.exit()
  }
})

gulp.task('check:git', () => {
  const checkCmdExisted = execSync('if ! [ -x "$(command -v git)" ]; then echo "0"; else echo "-1"; fi')
  if (!checkCmdExisted.toString() === '-1') {
    console.log('git not installed')
    process.exit()
  }
  const version = execSync('git --version | cut -d " " -f 3 | sed -e "s/ //g"')
  const versionStr = version.toString()
  if (compare(versionStr, envVersion.git.min) < 0) {
    console.warn('git should be at least ' + envVersion.git.min + ', current ' + versionStr)
    process.exit()
  }
})

gulp.task('dev:syncLib', shell.task([
  'rm -rf node_modules/' + libPackageInfo.name,
  'yarn '
], {cwd: './example', ignoreErrors: true}))

gulp.task('run:storybook', shell.task([
  'npm run storybook'
], {cwd: './example'}))

gulp.task('run:android', shell.task([
  'react-native run-android'
], {cwd: './example'}))

gulp.task('run:ios', shell.task([
  'react-native run-ios'
], {cwd: './example'}))

gulp.task('setup', ['check:node', 'check:git'], () => {
  shell('git config core.hooksPath ./.githooks')
  const install = require('gulp-install')
  return gulp.src(['./lib/package.json', 'example/package.json'])
   .pipe(install())
})

gulp.task('publish:major', shell.task([
  'npm version major',
  'npm publish --access=public',
  'git push --follow-tags'
], {cwd: './lib'}))

gulp.task('publish:minor', shell.task([
  'npm version minor',
  'npm publish --access=public',
  'git push --follow-tags'
], {cwd: './lib'}))

gulp.task('publish:patch', shell.task([
  'npm version patch',
  'npm publish --access=public',
  'git push --follow-tags'
], {cwd: './lib'}))

gulp.task('help', () => {
  console.log('\n------------------- React Native Library Seed Project -------------------')
  console.log(chalk.green('setup'), 'setup project init environment')

  console.log('')
  console.log(chalk.green('[run:storybook]'), 'start storybook packger server')
  console.log(chalk.green('[run:ios]'), 'start ios client, alias for `react-native run-ios` ')
  console.log(chalk.green('[run:android]'), 'start android client, alias for `react-native run-android` ')

  console.log('')
  console.log(chalk.green('[dev:syncLib]'), 'reinstall lib for example')

  console.log('')
  console.log(chalk.green('[publish:major]'), 'publish as a major version to npm')
  console.log(chalk.green('[publish:minor]'), 'publish as a minor version to npm')
  console.log(chalk.green('[publish:patch]'), 'publish as a patch version to npm')

  console.log('------------------- React Native Library Seed Project -------------------\n')
})
gulp.task('default', ['help'])
