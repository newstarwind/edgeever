const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = path.resolve(__dirname);
const config = getDefaultConfig(projectRoot);

// Force Metro's project root to the mobile app directory
// instead of letting it detect the workspace root
config.projectRoot = projectRoot;

module.exports = config;
