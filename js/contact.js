(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('contact-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('contact-name').value.trim();
    var email = document.getElementById('contact-email').value.trim();
    var message = document.getElementById('contact-message').value.trim();
    if (!name || !email || !message) {
      status.textContent = 'Please fill in every field before sending.';
      return;
    }
    var subject = encodeURIComponent('Raxi Game contact from ' + name);
    var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = 'mailto:support@rexigame.com?subject=' + subject + '&body=' + body;
    status.textContent = 'Opening your email app to send this message…';
  });
})();
