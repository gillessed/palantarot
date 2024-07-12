// webpack needs to be explicitly required
const webpack = require("webpack");

var path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const extractCss = new MiniCssExtractPlugin({
  filename: "src/[name].css",
  chunkFilename: "[id].css",
});

const html = new HtmlWebpackPlugin({
  inject: true,
  template: "index.html",
});

const staticFileRegex = /\.(woff|svg|ttf|eot|gif|jpeg|jpg|png|mp3)([\?]?.*)$/;

module.exports = {
  entry: {
    app: "./app/app.tsx",
  },
  output: {
    filename: "src/[name].bundle.js",
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".scss", ".css"],
  },
  devServer: {
    contentBase: path.resolve(__dirname, "build"),
    port: 4568,
    proxy: {
      "/api": "http://localhost:4567",
      "/static": "http://localhost:4567",
      "/ws": {
        target: "ws://localhost:4567",
        ws: true,
      },
    },
    publicPath: "/",
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: staticFileRegex,
        include: [path.resolve(__dirname, "node_modules")],
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    extractCss,
    html,
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
};
