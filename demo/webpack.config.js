let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => {
  return {
    entry: {
      app: './index.js',
      styles: '../packages/styles/index.scss'
    },
    output: {
      filename: '[name].js'
    },
    resolve: {
      extensions: ['.js', '.scss'],
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
          use: [
            'style-loader',
            'css-loader?sourceMap',
            'sass-loader?sourceMap'
          ]
        },
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),

      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve('./index.html')
      })
    ],
    devtool: 'source-map', //'cheap-module-eval-source-map',
    devServer: {
      port: 8081,
      host: '0.0.0.0',
      hot: true,
      inline: true,
      historyApiFallback: true
    }

  };
};
