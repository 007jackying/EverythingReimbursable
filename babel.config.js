module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
    env: {
      production: {
        // Strip console.log/info/debug from release bundles; keep error/warn
        plugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]]
      }
    }
  }
}
