const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'mfe-angular20-c',
  exposes: {
    './bootstrap': './src/bootstrap.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto' }),
  },
  skip: [
    'oxc-parser',
    '@oxc-parser/binding-win32-x64-msvc',
    '@angular/animations',
    '@angular/platform-browser/animations',
  ],
});
