(function () {
  var deferredPrompt;
  var installBtn = document.getElementById('app-install-btn');
  var installNote = document.getElementById('app-install-note');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
    });
  }

  window.addEventListener('appinstalled', function () {
    if (installNote) installNote.textContent = 'Raxi App is installed. Look for it on your home screen.';
  });
})();
