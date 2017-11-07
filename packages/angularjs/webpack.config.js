const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CssoWebpackPlugin = require('csso-webpack-plugin').default;

module.exports = () => {
  return {
    entry: {
      'atmention': [
        './index.js',
        path.resolve(__dirname, '../styles/index.scss'),
      ],
      'atmention.min': './index.js'
    },
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
      new UglifyJSPlugin({
        include: /\.min\.js$/
      }),
      new ExtractTextPlugin('[name].css'),
      new CssoWebpackPlugin({ pluginOutputPostfix: 'min' })
    ]
  };
};
