const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CssoWebpackPlugin = require('csso-webpack-plugin').default;

const pkg = require('./package.json');

module.exports = () => {
  let entry = {};

  entry[pkg.name] = [
    './index.js',
    path.resolve(__dirname, '../styles/index.scss')
  ];

  entry[pkg.name + '.min'] = [
    './index.js'
  ];

  return {
    entry: entry,
    output: {
      path: path.resolve('./dist'),
      filename: '[name].js'
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
        },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
          })
        }
      ]
    },
    plugins: [
      new ngAnnotatePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        include: /\.min\.js$/
      }),
      new ExtractTextPlugin('[name].css'),
      new CssoWebpackPlugin({ pluginOutputPostfix: 'min' })
    ]
  };
};
