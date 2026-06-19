(function () {
  try {
    var t = localStorage.getItem('ardine_theme');
    if (t === 'halloween') {
      document.documentElement.classList.add('halloween');
    } else if (t === 'christmas') {
      document.documentElement.classList.add('christmas');
    } else if (
      t === 'dark' ||
      (!t && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
      (t === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    }
  } catch (_) {}
})();
