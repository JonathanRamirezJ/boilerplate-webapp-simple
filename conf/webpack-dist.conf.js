const webpack = require("webpack");
const conf = require("./gulp.conf");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const FailPlugin = require("webpack-fail-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const pkg = require("../package.json");
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
        loaders: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader?minimize!sass-loader!postcss-loader"
        })
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
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      output: { comments: false },
      compress: { unused: true, dead_code: true, warnings: false } // eslint-disable-line camelcase
    }),
    new ExtractTextPlugin("main.css"),
    new webpack.optimize.CommonsChunkPlugin({ name: "vendor" }),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: () => [autoprefixer]
      }
    })
  ].concat(htmlPlugins),
  output: {
    path: path.join(process.cwd(), conf.paths.dist),
    filename: "[name].js"
  },
  entry: {
    app: `./${conf.path.src("index")}`,
    vendor: Object.keys(pkg.dependencies)
  }
};
