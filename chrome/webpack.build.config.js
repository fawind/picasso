/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
/* eslint-enable import/no-extraneous-dependencies */

const commonConfig = require('./webpack.config');


module.exports = Object.assign(
  {},
  commonConfig,
  {
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.NoErrorsPlugin(),
      new HtmlWebpackPlugin({
        template: path.join('src', 'index.html'),
        inject: true,
        hash: true,
      }),
      new CopyWebpackPlugin([
        { from: './src/manifest.json', to: 'manifest.json' },
      ]),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
      }),
      new webpack.NoErrorsPlugin(),
    ],
  });
