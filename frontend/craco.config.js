module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find and modify the source-map-loader rule to exclude DOMPurify
      const sourceMapLoaderRule = webpackConfig.module.rules.find(
        rule => rule.use && rule.use.includes && rule.use.includes('source-map-loader')
      );

      if (sourceMapLoaderRule) {
        sourceMapLoaderRule.exclude = [
          ...(sourceMapLoaderRule.exclude || []),
          /node_modules\/dompurify/,
        ];
      }

      // Suppress warnings about missing source maps using the correct format
      if (!webpackConfig.stats) {
        webpackConfig.stats = {};
      }
      
      webpackConfig.stats.warningsFilter = [
        /Failed to parse source map/,
        /dompurify/,
        /source-map-loader/
      ];

      return webpackConfig;
    },
  },
};
