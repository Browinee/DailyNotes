const path = require("path")
const ChunkTestPlugin = require("./ChunkTestPlugin")
const config = {
  mode: "development",
  entry: {
    pageA: "./pageA",
    pageB: "./pageB",
    pageC: "./pageC",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[id].chunk.js",
  },
  plugins: [new ChunkTestPlugin({})],
  optimization: {
    chunkIds: "natural",
  },
  module: {
    rules: [
      { test: /\.ts/, loader: "ts-loader" }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  }
};

module.exports = config;

