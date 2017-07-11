const gulp = require('gulp');
const ts = require('gulp-typescript');
const sass = require('gulp-sass');
const babel = require('gulp-babel');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('compile', () => {
  const tsResult = tsProject
    .src()
    .pipe(tsProject())
    .on('error', function(error) {});
  return tsResult.js
    .pipe(babel({
      presets: ['es2015']
    }))
    .on('error', function(error) {})
    .pipe(gulp.dest('build'));
});

gulp.task('copy-static', () => {
  gulp.src('static/**')
    .pipe(gulp.dest('build/static'));
  gulp.src('index.html')
    .pipe(gulp.dest('build'));
  gulp.src('config.json')
    .pipe(gulp.dest('build'));
});

gulp.task('compile-styles', () => {
  gulp.src('app/**/*.scss')
    .pipe(gulp.dest('build/app'));
});

gulp.task('watch-server', () => {
  gulp.watch('server/**/*.ts', ['compile']);
  gulp.watch('app/**/*.ts', ['compile']);
  gulp.watch('app/**/*.tsx', ['compile']);
  gulp.watch('app/**/*.scss', ['compile-styles']);
  gulp.watch('static/**', ['copy-static']);
});

gulp.task('default', ['compile', 'watch-server', 'copy-static', 'compile-styles']);
