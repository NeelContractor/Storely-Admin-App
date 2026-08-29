module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@store': './src/store',
            '@theme': './src/theme',
            '@types': './src/types',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@navigation': './src/navigation',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};