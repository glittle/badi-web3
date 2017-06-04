var
  config = require('../config'),
  webpack = require('webpack'),
  merge = require('webpack-merge'),
  cssUtils = require('./css-utils'),
  baseWebpackConfig = require('./webpack.base.conf'),
  HtmlWebpackPlugin = require('html-webpack-plugin')
  // serviceWorkerPlugin = require('serviceworker-webpack-plugin').default,
  // path = require('path')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/hot-reload'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
  // eval-source-map is faster for development
  devtool: '#eval-source-map',
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  module: {
    rules: cssUtils.styleRules({
      sourceMap: config.dev.cssSourceMap,
      postcss: true
    })
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      inject: true
    }),
    // new serviceWorkerPlugin({
    //   entry: path.join(__dirname, 'special/sw-badi-web3.js'),
    //   filename: 'sw-badi-web3.js',
    //   excludes: ['**/*']
    // })
  ],
  performance: {
    hints: false
  }
})
