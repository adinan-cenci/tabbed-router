const gulp    = require('gulp');
const rename  = require('gulp-rename');
const webpack = require('webpack-stream');
const sass    = require('gulp-sass')(require('sass'));

async function buildJs() 
{
    return gulp.src('./example.js')

    .pipe(webpack({
        mode: 'production',
    }))

    .pipe(rename('example.js'))

    .pipe(gulp.dest('./example/'));
}

exports.buildJs  = buildJs;
exports.default  = gulp.series(buildJs);
