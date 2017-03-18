var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({filename: "bundle.css"});
const staticFileRegex = /\.(woff|svg|ttf|eot|gif|jpeg|jpg|png)([\?]?.*)$/;

module.exports = {
  entry: ['./build/app/app.js', './build/app/app.scss'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build/app')
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [{
            loader: 'css-loader',
          }, {
            loader: 'sass-loader',  
          }],
          fallback: 'style-loader'
        }),
      },
      {
        test: /\.css$/,
        use: extractSass.extract({
          use: [{loader: 'css-loader'}],
          fallback: 'style-loader'
        }),
      },
      {
        test: staticFileRegex,
        include: [
          path.resolve(__dirname, "node_modules")
        ],
        loader: 'file-loader',
        query: {
          name: '[name]-[hash].[ext]',
        }
      },
    ],
  },
  plugins: [
    extractSass
  ],
};
