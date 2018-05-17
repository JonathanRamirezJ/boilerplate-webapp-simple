const webpack = require("webpack");
const conf = require("./gulp.conf");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const FailPlugin = require("webpack-fail-plugin");
const autoprefixer = require("autoprefixer");
const fs = require("fs");

function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve("./", templateDir));
  return templateFiles.map(item => {
    const parts = item.split(".");
    const name = parts[0];
    const extension = parts[1];
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: `${templateDir}/${name}.${extension}`
    });
  });
}

const htmlPlugins = generateHtmlPlugins("./src/templates");

module.exports = {
  module: {
    loaders: [
      {
        test: /\.json$/,
        loaders: ["json-loader"]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        enforce: "pre"
      },
      {
        test: /\.(css|scss)$/,
        loaders: ["style-loader", "css-loader", "sass-loader", "postcss-loader"]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    FailPlugin,
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: conf.path.src("index.html")
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: () => [autoprefixer]
      },
      debug: true
    })
  ].concat(htmlPlugins),
  devtool: "source-map",
  output: {
    path: path.join(process.cwd(), conf.paths.tmp),
    filename: "index.js"
  },
  entry: [
    "webpack/hot/dev-server",
    "webpack-hot-middleware/client",
    `./${conf.path.src("index")}`
  ]
};
