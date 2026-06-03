const gulp = require("gulp");
const zip = require("gulp-zip").default;

/**
 * Create distribution ZIP file.
 */
gulp.task("zip", function () {
  return gulp
    .src([
      "**/*",
      "!node_modules/**",
      "!src/**",
      "!vendor/**",
      "!*.zip",
      "!gulpfile.js",
      "!webpack.config.js",
      "!tsconfig.json",
      "!package.json",
      "!package-lock.json",
      "!composer.json",
      "!composer.lock",
      "!dev-preview.php",
      "!.claude/**",
    ])
    .pipe(zip("vvp-divi5-extensions.zip"))
    .pipe(gulp.dest("."));
});

gulp.task("default", gulp.series("zip"));
