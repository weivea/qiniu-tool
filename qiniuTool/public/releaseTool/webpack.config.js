var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
  entry: './index.js',
  output: {
    path: 'build',
    filename: 'build.js'
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        exclude: /node_modules|vue\/src/,
        loader: 'babel?optional[]=runtime&loose=true'
      },
      { test: /\.css$/,loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
      { test: /\.(jpg|png|OTF|TTF|woff2)$/,loader: "url-loader?limit=8192"}

    ]
  },
  devtool: 'source-map',
  plugins: [
    new ExtractTextPlugin("styles.css")
  ]
};
