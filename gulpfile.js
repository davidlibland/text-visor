/**
 * @file gulpfile.js
 */

// 3rd party modules
const child_process = require("child_process");
const gulp = require("gulp");
const typedoc = require("gulp-typedoc");

// HDx modules
// - N/A

// Task names
const TASK_NAME_COMPILE_TS = "compile-ts";
const TASK_NAME_DOCUMENT_TS = "typedoc";
const TASK_NAME_WATCH = "watch";
const TASK_NAME_DEFAULT = "default";

// Commands to execute on command line.
/**
 * @const CMD_TS_CLEAN
 * @desc Rm command to clear all existing COMPILED files in root directory.
 *     This should be a list of ALL directories/files in this module's
 *     root directory that contain compiled TS->JS files, and typically contains
 *     all JS folders except ts_src.
 */
const CMD_TS_CLEAN = "rm -rf .src/*"

/**
 * @const CMD_TS_COMPILE
 * @desc Command to run to compile Typescript for this project.
 */
const CMD_TS_COMPILE = "./node_modules/.bin/tsc"


/**
 * Compile task.
 */
gulp.task(TASK_NAME_COMPILE_TS, function() {
  child_process.exec([CMD_TS_CLEAN, CMD_TS_COMPILE].join("; "), function(error, stdout, stderr) {
    if (error) {
      console.error(`${TASK_NAME_COMPILE_TS} task error: ${error}. stdout:{${stdout}}; stderr:{${stderr}}`);
      return;
    }
    console.log(`${TASK_NAME_COMPILE_TS} task compilation complete. stdout:{${stdout}}; stderr:{${stderr}}`);
  });
});

/**
 * @const CMD_TS_COMPILE
 * @desc Command to run to compile Typescript for this project.
 */
const CMD_TS_DOCUMENT = "./node_modules/.bin/typedoc"

/**
 * Documentation task.
 */
gulp.task(TASK_NAME_DOCUMENT_TS, function() {
  return gulp.src(["ts_src/**/*.ts"])
    .pipe(typedoc({
      module: "commonjs",
      target: "es6",
      out: "docs/",
      name: "TextVisor",
      mode: "modules",
      readme: "./README.md",
      verbose: true,
      exclude: "ts_src/tests/**/*",
    }));
});


/**
 * Watcher tasks.
 */
gulp.task(TASK_NAME_WATCH, function() {
  // Run compile task any time any .ts/.tsx files change.
  gulp.watch(["ts_src/**/*.ts"], [TASK_NAME_COMPILE_TS, TASK_NAME_DOCUMENT_TS]);
});


/**
 * Default task.
 */
gulp.task(TASK_NAME_DEFAULT, [TASK_NAME_COMPILE_TS, TASK_NAME_WATCH, TASK_NAME_DOCUMENT_TS]);
