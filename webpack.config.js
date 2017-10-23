const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = () => {
  return {
    entry: './src/frameworks/angularjs',
    output: {
      path: path.resolve('./dist'),
      filename: 'atmention-angularjs.min.js'
    },
    resolve: {
      extensions: ['.js'],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          exclude: /node_modules/,
          use: 'jshint-loader'
        },
        {
          test: /\.html$/,
          use: 'html-loader'
        }
      ]
    },
    plugins: [
      new ngAnnotatePlugin(),
      new UglifyJSPlugin()
    ]
  };
};
