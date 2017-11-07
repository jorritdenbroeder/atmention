'use strict';

var path = require('path');

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'test/index.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap'],
    },

    webpack: {
      devtool: 'inline-sourcemap',
      module: {
        rules: [
          {
            test: /\.html$/,
            use: 'html-loader'
          },
          {
            test: /\.js$/,
            enforce: 'post',
            use: 'istanbul-instrumenter-loader',
            include: path.resolve(__dirname + '/src'),
            exclude: /node_modules|\.spec\.js$/,
          }
        ]
      }
    },

    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-mocha-reporter',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-coverage-istanbul-reporter',
      'karma-sourcemap-loader'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage-istanbul'],


    coverageIstanbulReporter: {
      dir: path.join(__dirname, 'coverage'),
      reports: ['html', 'lcovonly'],
      'report-config': {
        html: {
          subdir: 'html'
        },
        lcov: {
          subdir: 'lcov'
        }
      },
      fixWebpackSourcePaths: true
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],
    // browsers: ['Chrome'],

    // https://github.com/karma-runner/karma-phantomjs-launcher/issues/126
    // on disconnect, makes karma to launch another phantonJs window to restart the testcases
    browserDisconnectTolerance: 5,
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 30000,
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,


    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity

  });

};
