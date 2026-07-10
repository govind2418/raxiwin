(function () {
  var form = document.getElementById('login-form');
  var nameInput = document.getElementById('login-name');
  var status = document.getElementById('login-status');
  var current = document.getElementById('login-current');
  var logoutBtn = document.getElementById('login-logout');
  var errorEl = document.getElementById('login-name-error');
  if (!form) return;

  function render() {
    var name = localStorage.getItem('raxi_profile_name');
    if (name) {
      current.textContent = 'Logged in as ' + name + '.';
      current.hidden = false;
      logoutBtn.hidden = false;
      nameInput.value = name;
    } else {
      current.hidden = true;
      logoutBtn.hidden = true;
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = nameInput.value.trim();
    if (!val) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'Please enter a display name.';
      nameInput.setAttribute('aria-invalid', 'true');
      return;
    }
    errorEl.style.display = 'none';
    nameInput.removeAttribute('aria-invalid');
    localStorage.setItem('raxi_profile_name', val);
    status.textContent = 'Saved! You are logged in as ' + val + ' on this device.';
    render();
  });

  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('raxi_profile_name');
    nameInput.value = '';
    status.textContent = 'You have been logged out on this device.';
    render();
  });

  render();
})();
