const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Explicitly tell Metro to resolve modules from the mobile app's node_modules
// instead of following bun workspace symlinks to the root
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

module.exports = config;
