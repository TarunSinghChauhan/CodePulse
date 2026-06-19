/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Monaco needs this to load web workers correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      "monaco-editor": "monaco-editor/esm/vs/editor/editor.api",
    };
    return config;
  },
};

module.exports = nextConfig;
