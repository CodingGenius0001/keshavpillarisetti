(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggleFab');
  if (!btn) return;

  const saved = localStorage.getItem('theme');
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (preferredDark ? 'dark' : 'light');

  root.setAttribute('data-theme', theme);

  function paintIcon(currentTheme) {
    const isDark = currentTheme === 'dark';
    btn.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  paintIcon(theme);

  btn.addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    paintIcon(next);
  });
})();
