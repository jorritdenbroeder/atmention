const path = require('path');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const pkg = require('./package.json');

const tsconfig = process.env.NODE_ENV === 'production'
  ? path.resolve(__dirname, './tsconfig.prod.json')
  : path.resolve(__dirname, './tsconfig.json');

module.exports = () => {

  return {

    devtool: 'source-map',

    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    entry: {
      [pkg.name]: [
        './src/index.ts',
        './src/styles/index.scss'
      ]
    },

    output: {
      path: path.resolve('./dist'),
      filename: '[name].js'
    },

    resolve: {
      extensions: ['.js', '.ts'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: tsconfig
        }),
      ]
    },

    externals: [
      'angular',
      'atmention-core',
    ],

    module: {
      rules: [
        {
          test: /\.(js|ts)x?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: tsconfig
            }
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
