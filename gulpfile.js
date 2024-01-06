const gulp    = require('gulp');
const rename  = require('gulp-rename');
const webpack = require('webpack-stream');
const sass    = require('gulp-sass')(require('sass'));

async function buildJs() 
{
    return gulp.src('./main.js')

    .pipe(webpack({
        mode: 'production',
    }))

    .pipe(rename('main.js'))

    .pipe(gulp.dest('./dist/'));
}

exports.buildJs  = buildJs;
exports.default  = gulp.series(buildJs);
