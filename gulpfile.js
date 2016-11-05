var gulp = require('gulp');

var less = require('gulp-less');

gulp.task('less', function() {
	return gulp.src('src/style')
		.pipe(sass())
		.pipe(gulp.dest('tmp'))
});


gulp.task('default', ['sass']);