module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // If there's already a resolve.fallback object, spread it to keep existing settings
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        url: require.resolve("url/"), // or "false" if you want to disable it
      };
      return webpackConfig;
    },
  },
};
