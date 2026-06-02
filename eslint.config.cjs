// Minimal flat config that re-uses eslint-config-next
try {
  const nextConfig = require('eslint-config-next');
  // `eslint-config-next` may export either an object or an array of configs.
  // ESLint flat config expects either an object or an array of objects, but
  // nesting arrays can produce "Unexpected array" errors. Normalize here.
  if (Array.isArray(nextConfig)) {
    module.exports = nextConfig;
  } else if (nextConfig && typeof nextConfig === 'object') {
    module.exports = [nextConfig];
  } else {
    module.exports = [];
  }
} catch (e) {
  // If eslint-config-next can't be required for some reason, export a fallback empty config
  module.exports = [];
}
