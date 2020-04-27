module.exports = function (config) {

  config.set({

    basePath: '',

    frameworks: ['jasmine', '@angular-devkit/build-angular'],

    plugins: [
      '@angular-devkit/build-angular/plugins/karma',
      'karma-jsdom-launcher',
      'karma-jasmine',
      'karma-jasmine-html-reporter',
      'karma-mocha-reporter',
      'karma-coverage-istanbul-reporter',
    ],

    client: {
      clearContext: false
    },

    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'),
      reports: ['html', 'lcovonly'],
      'report-config': {
        html: {
          subdir: 'html'
        }
      },
      fixWebpackSourcePaths: true
    },

    reporters: ['mocha', 'kjhtml'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['jsdom'],

    singleRun: false,

    restartOnFileChange: true
  });
};
