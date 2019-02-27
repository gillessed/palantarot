var path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: {
    psqlDump: './migration/psqlDump.ts',
    psqlIngest: './migration/psqlIngest.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'migrationBuild')
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
};