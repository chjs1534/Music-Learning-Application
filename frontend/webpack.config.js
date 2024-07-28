const path = require("path");
const { TamaguiPlugin } = require("tamagui-loader");

module.exports = {
  entry: "./app/index.web.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/, // Handle CSS files
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|svg|gif)$/, // Handle image files
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8081,
    historyApiFallback: true,
  },
};

config.plugins.push(
  new TamaguiPlugin({
    config: "./src/tamagui.config.ts",
    components: ["tamagui"],
  })
);
