// Minimal flat config that re-uses eslint-config-next
try {
  module.exports = [require('eslint-config-next')];
} catch (e) {
  // If eslint-config-next can't be required for some reason, export a fallback empty config
  module.exports = [];
}
