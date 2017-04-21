var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
//var cssnano = require('cssnano');
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

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass()) // Passes it through a gulp-sass, log errors to console
    .pipe(gulp.dest('app/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})

// concate + minify CSS and JS and move to deploy directory
gulp.task('useref', function() {
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    // .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// minify images and move to deploy directory
gulp.task('images', function(){
	return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg')
		.pipe(cache(imagemin({interlaced: true})))
		.pipe(gulp.dest('dist/images'))
});


// move fonts to deploy directory
gulp.task('fonts', function(){
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'))
});


// clean out files in the deploy directory
gulp.task('clean',function(){
	return del.sync('dist').then(function(cb) {
		return cache.clearAll(cb);
	});
});


// clean out everything but the images in the deploy directory
gulp.task('clean:dist', function(){
	return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});



// watchers

gulp.task('watch',['browserSync','sass'] ,function(){
	gulp.watch('app/scss/**/*.scss',['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});



// build sequences

gulp.task('build', function (callback){
	runSequence('clean:dist', 'sass',['useref','images','fonts'], 
		callback
	)
});

gulp.task('default', function (callback) {
	runSequence(['sass','browserSync'],'watch',callback)
});

gulp.task('nunjucks', function(){
	return gulp.src('app/pages/**/*.+(html|nunjucks)')
		.pipe(data(function(){return require('./app/data/data.json')}))
		.pipe(nunjucksRender({
			path: ['app/templates']
		}))
		.pipe(gulp.dest('app'))
});
