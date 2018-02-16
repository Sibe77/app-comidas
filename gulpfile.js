var gulp = require('gulp');

var plumber = require('gulp-plumber');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

// for prod
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var minifyHTML = require('gulp-minify-html');

// BUILDING FOR DEVELOPMENT!

// Builds the tmp development dir, serves it, and reload the browser on style changes
gulp.task('serve', ['developmentBuildTmp'], function() {
	browserSync({
		server : {
			baseDir: ['tmp']
		}
	});
	gulp.start('watch');
});

	gulp.task('watch', function() {
		gulp.watch('src/assets/css/styles.less', ['less']);
		gulp.watch('src/index.html', ['html']);
		gulp.watch('src/assets/js/*', ['js']);
		gulp.watch('src/app/*/*/*', ['app']);
		gulp.watch('src/app/*', ['app']);
	});

	gulp.task('developmentBuildTmp',['styles','images','html','assetsjs','app']);

		// Builds the tmp development dir, serves it, and reload the browser on style changes
		gulp.task('styles', ['fonts','less']);
			gulp.task('fonts', function() {
				return gulp.src('src/assets/css/fonts/*')
					.pipe(plumber())
					.pipe(gulp.dest('tmp/assets/css/fonts'))
					.pipe(gulp.dest('mobile/www/assets/css/fonts'))
			});
			gulp.task('less', function() {
				return gulp.src('src/assets/css/styles.less')
					.pipe(plumber())
					.pipe(sourcemaps.init())
					.pipe(less())
					.pipe(autoprefixer({
						browsers: ['last 2 versions'],
						cascade: false
					}))
					.pipe(sourcemaps.write())
					.pipe(gulp.dest('tmp/assets/css'))
					.pipe(gulp.dest('mobile/www/assets/css'))
					.pipe(reload({ stream: true }));
			});

		gulp.task('images', function() {
			return gulp.src('src/assets/img/*')
				.pipe(plumber())
				.pipe(gulp.dest('tmp/assets/img'))
				.pipe(gulp.dest('mobile/www/assets/img'));
		});

		gulp.task('html', function() {
			return gulp.src('src/index.html')
				.pipe(plumber())
				.pipe(gulp.dest('tmp'))
				.pipe(reload({ stream: true }));
		});

		gulp.task('assetsjs', function() {
			return gulp.src('src/assets/js/*')
				.pipe(plumber())
				.pipe(gulp.dest('tmp/assets/js'))
				.pipe(gulp.dest('mobile/www/assets/js'));
		});

		gulp.task('app', ['appSubFolders','appFolderFiles']);
			gulp.task('appSubFolders', function() {
				return gulp.src('src/app/*/*/*')
					.pipe(plumber())
					.pipe(gulp.dest('tmp/app'))
					.pipe(gulp.dest('mobile/www/app'));
			});
			gulp.task('appFolderFiles', ['appModule','appRoutes']);
				gulp.task('appModule', function() {
					return gulp.src('src/app/app.module.js')
						.pipe(plumber())
						.pipe(gulp.dest('tmp/app'));
				});
				gulp.task('appRoutes', function() {
					return gulp.src('src/app/app.routes.js')
						.pipe(plumber())
						.pipe(gulp.dest('tmp/app'))
						.pipe(gulp.dest('mobile/www/app'));
				});

// BUILDING FOR PRODUCTION!

gulp.task('fonts:prod', function() {
	return gulp.src('src/assets/css/fonts/*')
		.pipe(plumber())
		.pipe(gulp.dest('dist/assets/css/fonts'))
});
gulp.task('less:prod', function() {
	return gulp.src('src/assets/css/styles.less')
		.pipe(plumber())
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(cssmin())
		.pipe(gulp.dest('dist/assets/css'));
});
gulp.task('styles:prod', ['fonts:prod','less:prod']);

gulp.task('images:prod', function() {
	return gulp.src('src/assets/img/*')
		.pipe(plumber())
		.pipe(gulp.dest('dist/assets/img'))
});

gulp.task('html:prod', function() {
	return gulp.src('src/index.html')
		.pipe(plumber())
		.pipe(minifyHTML({}))
		.pipe(gulp.dest('dist'))
});

gulp.task('assetsjs:prod', function() {
	return gulp.src('src/assets/js/*')
		.pipe(plumber())
		.pipe(uglify({compress:true}))
		.pipe(gulp.dest('dist/assets/js'))
});

gulp.task('app:prod', ['appSubFoldersJs:prod','appSubFoldersHtml:prod','appFolderFiles:prod']);
gulp.task('appSubFoldersJs:prod', function() {
	return gulp.src('src/app/*/*/*.js')
		.pipe(plumber())
		.pipe(uglify({compress:true}))
		.pipe(gulp.dest('dist/app'))
});
gulp.task('appSubFoldersHtml:prod', function() {
	return gulp.src('src/app/*/*/*.html')
		.pipe(plumber())
		.pipe(minifyHTML({}))
		.pipe(gulp.dest('dist/app'))
});
gulp.task('appFolderFiles:prod', function() {
	return gulp.src('src/app/*')
		.pipe(plumber())
		.pipe(uglify({compress:true}))
		.pipe(gulp.dest('dist/app'))
});

gulp.task('cname:prod', function() {
	return gulp.src('CNAME')
		.pipe(plumber())
		.pipe(gulp.dest('dist'))
});

gulp.task('build',['styles:prod','assetsjs:prod','images:prod','html:prod','app:prod','cname:prod']);

// Builds the dist development dir, serves it, and reload the browser on style changes
gulp.task('serve:prod', ['build'], function() {
	browserSync({
		server : {
			baseDir: ['dist']
		}
	});
	gulp.start('watch');
});
