let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => {
  return {
    entry: './index.js',
    output: {
      filename: 'app.js'
    },
    resolve: {
      extensions: ['.js', '.css'],
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
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),

      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve('./index.html')
      })
    ],
    devtool: 'cheap-module-eval-source-map',
    devServer: {
      port: 8081,
      host: '0.0.0.0',
      hot: true,
      inline: true,
      historyApiFallback: true
    }

  };
};
