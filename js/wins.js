(function () {
  function get(key, fallback) {
    var v = localStorage.getItem('raxi_best_' + key);
    return v === null ? fallback : v;
  }

  var rows = [
    { key: 'snake', unit: 'pts', badge: 12 },
    { key: '2048', unit: 'pts', badge: 512 },
    { key: 'memory_moves', unit: 'moves', badge: 10, lowerIsBetter: true },
    { key: 'ttt_wins', unit: 'wins', badge: 3 },
    { key: 'whack', unit: 'pts', badge: 15 },
    { key: 'reaction', unit: 'ms', badge: 300, lowerIsBetter: true }
  ];

  var tbody = document.getElementById('wins-body');
  var badgeWrap = document.getElementById('wins-badges');
  var emptyNote = document.getElementById('wins-empty');
  if (!tbody) return;

  var anyScore = false;
  var badgeCount = 0;

  rows.forEach(function (r) {
    var tr = tbody.querySelector('tr[data-key="' + r.key + '"]');
    if (!tr) return;
    var cells = tr.querySelectorAll('td');
    var raw = get(r.key, null);
    var have = raw !== null;
    if (have) anyScore = true;
    var earned = have && (r.lowerIsBetter ? Number(raw) <= r.badge : Number(raw) >= r.badge);
    if (earned) badgeCount++;
    cells[1].textContent = have ? raw + ' ' + r.unit : '—';
    cells[2].innerHTML = earned
      ? '<span class="badge badge-new">Unlocked</span>'
      : '<span style="color:var(--text-mute)">Locked</span>';
  });

  if (badgeWrap) badgeWrap.textContent = badgeCount + ' of ' + rows.length + ' achievements unlocked';
  if (emptyNote) emptyNote.hidden = anyScore;
})();
