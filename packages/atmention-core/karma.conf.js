const path = require('path');

module.exports = function (config) {
  config.set({

    basePath: '.',

    frameworks: ['jasmine'],

    files: [
      'test/index.ts'
    ],

    preprocessors: {
      'test/index.ts': ['webpack'],
    },

    webpack: {
      devtool: 'inline-sourcemap',
      mode: 'development',
      resolve: {
        extensions: ['.js', '.ts'],
      },
      module: {
        rules: [
          {
            test: /\.(js|ts)x?$/,
            use: 'ts-loader'
          },
          {
            test: /\.(js|ts)$/,
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
      'karma-jsdom-launcher',
      'karma-coverage-istanbul-reporter'
    ],

    reporters: ['mocha', 'coverage-istanbul'],

    coverageIstanbulReporter: {
      dir: path.join(__dirname, 'coverage'),
      reports: ['html', 'lcovonly'],
      'report-config': {
        html: {
          subdir: 'html'
        }
      },
      fixWebpackSourcePaths: true
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['jsdom'],

    singleRun: false,

    concurrency: Infinity

  });

};
