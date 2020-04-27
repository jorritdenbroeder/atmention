let path = require('path');
let webpack = require('webpack');
let CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
let HtmlWebpackPlugin = require('html-webpack-plugin');
let TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = () => {

  return {

    devtool: 'source-map',

    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    entry: {
      app: path.join(__dirname, 'src/index.js'),
      styles: path.join(__dirname, 'src/index.scss'),
    },

    output: {
      filename: '[name].js'
    },

    resolve: {
      extensions: ['.js', '.ts'],
      plugins: [
        new TsconfigPathsPlugin(),
      ],
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
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
      ]
    },

    plugins: [
      new CleanWebpackPlugin(),
      
      new webpack.HotModuleReplacementPlugin(),

      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, 'src/index.html')
      })
    ],

    devServer: {
      port: 8080,
      host: '0.0.0.0',
      hot: true,
      inline: true,
      historyApiFallback: true
    },

  };
};
