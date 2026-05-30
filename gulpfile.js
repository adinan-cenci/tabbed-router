const gulp    = require('gulp');
const rename  = require('gulp-rename');
const webpack = require('webpack-stream');

async function buildJs() 
{
    return gulp.src('./example.js')

    .pipe(webpack({
        mode: 'development',
    }))

    .pipe(rename('example.js'))

    .pipe(gulp.dest('./examples/'));
}

exports.buildJs  = buildJs;
exports.default  = gulp.series(buildJs);
