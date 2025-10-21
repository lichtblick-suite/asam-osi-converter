const path = require("path");

module.exports = {
  webpack: (config) => {
    config.module?.rules?.push({
      test: /\.(png)$/i,
      type: "asset/inline",
    });

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@assets": path.resolve(__dirname, "assets"),
      "@converters": path.resolve(__dirname, "src/converters"),
      "@features": path.resolve(__dirname, "src/features"),
      "@": path.resolve(__dirname, "src"),
    };

    return config;
  },
};
