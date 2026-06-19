// Minimal flat config that re-uses eslint-config-next
let baseConfig = [];
try {
  const nextConfig = require('eslint-config-next');
  if (Array.isArray(nextConfig)) {
    baseConfig = nextConfig;
  } else if (nextConfig && typeof nextConfig === 'object') {
    baseConfig = [nextConfig];
  }
} catch (e) {
  // If eslint-config-next can't be required for some reason, export a fallback empty config
}

module.exports = [{ ignores: ['coverage/'] }, ...baseConfig];
