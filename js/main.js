(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  var header = document.querySelector('.site-header');
  if (toggle && links) {
    function setMenuOpen(open) {
      links.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      if (header) header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      toggle.textContent = open ? 'Close' : '☰ Menu';
    }

    toggle.addEventListener('click', function () {
      setMenuOpen(!links.classList.contains('open'));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenuOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (links.classList.contains('open') && !header.contains(e.target)) setMenuOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        setMenuOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && links.classList.contains('open')) setMenuOpen(false);
    });
  }
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
