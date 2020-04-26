const path = require('path');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const pkg = require('./package.json');

module.exports = () => {

  return {

    devtool: 'source-map',

    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    entry: {
      [pkg.name]: [
        './index.js',
        './src/styles/index.scss'
      ]
    },

    output: {
      path: path.resolve('./dist'),
      filename: '[name].js'
    },

    resolve: {
      extensions: ['.js', '.ts'],
    },

    module: {
      rules: [
        {
          test: /\.(js|ts)x?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
          },
        },
        {
          test: /\.html$/,
          use: 'html-loader'
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader'
          ],
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin(),

      new ngAnnotatePlugin(),

      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),

      new CopyWebpackPlugin([
        {
          context: 'src/styles',
          from: '**/*',
          to: 'scss'
        },
      ]),
    ],

  };
};
