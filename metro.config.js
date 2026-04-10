const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const gradlePluginRoots = [
  "node_modules[\\\\/]expo-dev-launcher[\\\\/]expo-dev-launcher-gradle-plugin",
  "node_modules[\\\\/]expo-modules-core[\\\\/]expo-module-gradle-plugin",
];

const blockedNodeModuleArtifacts = [
  ...gradlePluginRoots.map((root) => `${root}[\\\\/]build[\\\\/].*`),
  ...gradlePluginRoots.map((root) => `${root}[\\\\/]bin[\\\\/].*`),
  ...gradlePluginRoots.map((root) => `${root}[\\\\/]\\.gradle[\\\\/].*`),
  ...gradlePluginRoots.map((root) => `${root}[\\\\/]\\.kotlin[\\\\/].*`),
  ...gradlePluginRoots.map((root) => `${root}[\\\\/]\\.settings[\\\\/].*`),
  ...gradlePluginRoots.map((root) => `${root}[\\\\/]\\.classpath$`),
  ...gradlePluginRoots.map((root) => `${root}[\\\\/]\\.project$`),
];

config.resolver.blockList = new RegExp(
  blockedNodeModuleArtifacts.join("|")
);

module.exports = config;
