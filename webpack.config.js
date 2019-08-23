const path = require('path');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const StatsWebpackPlugin = require('stats-webpack-plugin');

module.exports = {
  devServer: {
    // Needed for viewing in IE11 on VM
    host: '0.0.0.0',
    proxy: {
      '/bigdata': 'http://localhost:8081'
    }
  },
  entry: './client.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'client.js'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              [
                "@babel/transform-runtime",
                {
                  regenerator: true
                }
              ]
            ],
            presets: [
              '@babel/preset-react',
              [
                "@babel/preset-env",
                {
                  modules: false,
                  targets: {
                    ie: "11"
                  }
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  node: {
    fs: 'empty',
    Buffer: true
  },
  plugins: [
    new DuplicatePackageCheckerPlugin(),
    new HtmlWebpackPlugin({template: 'index.html'}),
    new OpenBrowserPlugin(),
    new StatsWebpackPlugin('stats.json')
  ],
  resolve: {
    alias: {
      bluebird: 'core-js/fn/promise'
    },
    mainFields: ['module', 'main']
  }
};
