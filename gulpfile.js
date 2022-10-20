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
const del = require("del");
//const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
//const replace = require('gulp-replace');
//const include = require('gulp-file-include');

//Шаблоны шапки и футера

//const includehtml = () => {
//  return gulp.src("source/*.html")
//  .pipe(include())
//  .pipe(gulp.dest("build"));
//}
//
//exports.includehtml = includehtml;

//HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

// Scripts Работает

const scripts = () => {
  return gulp.src("source/js/*.js")
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
      imagemin.jpegtran({progressive: true}),
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
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[style]').removeAttr('style');
        $('[stroke]').removeAttr('stroke');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/icons"));
}

exports.svgsprite = svgsprite;

//Копирование изображений для просмотра в браузере

const copyImages = () => {
  return gulp.src([
    "source/img/**/*.{png,jpg,svg}",
    "!source/img/icons/*.svg"
  ])
    .pipe(gulp.dest("build/img"))
}

exports.copyImages = copyImages;

// Clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Copy

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "!source/img/icons/*.svg"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

exports.copy = copy;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'  //было sourse
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload

const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/js/*.js", gulp.series(scripts));
  gulp.watch("source/*.html", gulp.series(html, reload));
  //gulp.watch("source/*.html").on("change", sync.reload);  было
}

// Сборка в продакшн

const build = gulp.series(
  clean,
  copy,
  images,
  gulp.parallel(
    styles,
    html,
    scripts,
    svgsprite,
    imagewebp
  ),
);

exports.build = build;

//Было
//exports.default = gulp.series(
//  styles, server, watcher
//);

// Этот скрипт для просмотра на сервере

exports.default = gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svgsprite,
    imagewebp
  ),
  gulp.series(
    server,
    watcher
  )
);

//webmanifest не нужно копировать в папку сборки?!
