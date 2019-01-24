var path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const copyStatic = new CopyWebpackPlugin([
  { from: './static', to: './static'},
  { from: './config.json'}
]);

module.exports = {
  target: 'node',
  entry: './server/index.ts',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'build')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
    ],
  },
  plugins: [
    copyStatic,
  ],
};
