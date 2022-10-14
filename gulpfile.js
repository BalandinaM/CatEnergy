const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require('gulp-sass')(require('sass'));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const sync = require("browser-sync").create();
const htmlmin = require("gulp-htmlmin");
const terser = require("gulp-terser");
const rename  = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const path = require("path");
const htmlmin2 = require("gulp-html-minifier-terser");


//HTML

//const html = () => {
//  return gulp.src("sourse/*.html")
//    .pipe(htmlmin2({ collapseWhitespace: true }))
//    .pipe(gulp.dest("build/html"));
//}
//
//exports.html = html;

const html = () => {
  return gulp.src("sourse/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

//const html = ('minify', () => {
//  return gulp.src("sourse/*.html")
//    .pipe(htmlmin({ collapseWhitespace: true }))
//    .pipe(gulp.dest('build'));
//});



// Scripts Работает

const scripts = () => {
  return gulp.src("source/js/mobile-menu.js")
    .pipe(terser())
    .pipe(rename("mobile-menu.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

exports.scripts = scripts;

// Styles  Работает

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

//Img  Работает!!!!

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"))
}

exports.images = images;

// WebP   Работает!

const imagewebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"))
}

exports.imagewebp = imagewebp;


//SVG Вроде заработало..

const svgsprite = () => {
  return gulp.src("source/img/icons/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/icons"));
}

exports.svgsprite = svgsprite;

//const svgsprite = () => {
//  return gulp.src("sourse/img/icons/*.svg")
//    .pipe(svgmin((file) => {
//      const prefix = path.basename(file.relative, path.extname(file.relative));
//        return {
//            plugins: [{
//                cleanupIDs: {
//                    prefix: prefix + '-',
//                    minify: true
//                }
//            }]
//        }
//    }))
//    .pipe(svgstore({inlineSvg: true}))
//    .pipe(rename("sprite.svg"))
//    .pipe(gulp.dest("build/img"));
//}
//
//exports.svgsprite = svgsprite;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  styles, server, watcher
);
