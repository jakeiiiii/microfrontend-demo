const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index',
  mode: 'production',
  output: {
    publicPath: '/mfe/react/',
    filename: 'main.js',
    clean: true,
  },
  resolve: { extensions: ['.jsx', '.js'] },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfeReact',
      library: { type: 'var', name: 'mfeReact' },
      filename: 'remoteEntry.js',
      exposes: { './bootstrap': './src/index.jsx' },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};
