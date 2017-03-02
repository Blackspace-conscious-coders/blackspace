var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');

// live reloading in browser
gulp.task('browserSync', function(){
	browserSync({
		server:{
			baseDir: "app"
		}
	})
})

// compile sass to css and move into css development directory
gulp.task('sass', function(){
	return gulp.src('app/scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({ stream: true }));
});

// concate + minify CSS and JS and move to deploy directory
gulp.task('useref', function(){
	var assets = useref.assets();

	return gulp.src('app/*.html')
		.pipe(assets)
		.pipe(gulpIf('*.css',minifyCSSS()))
		.pipe(gulpIf('*.js',uglify()))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('dist'))

});

// minify images and move to deploy directory
gulp.task('images', function(){
	return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg')
		.pipe(cache(imagemin({})))
		.pipe(gulp.dest('dist/images'))
});


// move fonts to deploy directory
gulp.task('fonts', function(){
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dist('dist/fonts'))
});


// clean out files in the deploy directory
gulp.task('clean',function(){
	del('dist');
	return cache.clearAll(callback);
});


// clean out everything but the images in the deploy directory
gulp.task('clean:dist', function(callback){
	del(['dist/**/*','!dist/images','!dist/images/**/*'], callback)
});


gulp.task('watch',['browserSync','sass'] ,function(){
	gulp.watch('app/scss/**/*.scss',['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});


gulp.task('build', function (callback){
	runSequence('clean:dist',['sass','useref','images','fonts'], callback)
});


gulp.task('default', function (callback) {
	runSequence(['sass','browserSync','watch'],callback)
});


gulp.task('nunjucks', function(){
	return gulp.src('app/pages/**/*.+(html|nunjucks)')
		.pipe(data(function(){return require('./app/data/data.json')}))
		.pipe(nunjucksRender({
			path: ['app/templates']
		}))
		.pipe(gulp.dest('app'))
});
