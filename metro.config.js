const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [...config.watchFolders];

config.resolver.blockList = [
  /astro-beacon-reference\/.*/,
];

module.exports = config;
