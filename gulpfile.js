const gulp = require('gulp')
const chalk = require('chalk')
const install = require('gulp-install')
const shell = require('gulp-shell')

const libPackageInfo = require('./lib/package.json')
console.log(libPackageInfo.name)

gulp.task('check:node', shell.task([
  'if [[ !`node --version | cut -d "v" -f 2 | sed -e "s/ //g"` < "7.0.0" ]]; then echo "node version 7 is preferred"; fi'
]))

gulp.task('check:git', shell.task([
  'if [[ !`git --version | cut -d " " -f 3 | sed -e "s/ //g"` < "2.9.0" ]]; then echo "git version should greate than 2.9.0 which supoorts our githook"; fi'
]))

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

gulp.task('setup', ['check:git', 'check:node'], () => {
  shell('git config core.hooksPath ./.githooks')
  return gulp.src(['./lib/package.json', 'example/package.json'])
   .pipe(install('npm install '))
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
