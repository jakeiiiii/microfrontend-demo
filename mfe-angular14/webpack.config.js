const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const config = withModuleFederationPlugin({
  name: 'mfeAngular14',
  library: { type: 'var', name: 'mfeAngular14' },
  filename: 'remoteEntry.js',
  exposes: {
    './bootstrap': './src/main.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto' }),
  },
});

config.output = config.output || {};
config.output.publicPath = '/mfe/angular14/';

module.exports = config;
