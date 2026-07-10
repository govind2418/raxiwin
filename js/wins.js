(function () {
  function get(key, fallback) {
    var v = localStorage.getItem('raxi_best_' + key);
    return v === null ? fallback : v;
  }

  var rows = [
    { key: 'snake', label: 'Raxi Snake', unit: 'pts', badge: 12 },
    { key: '2048', label: 'Raxi 2048', unit: 'pts', badge: 512 },
    { key: 'memory_moves', label: 'Memory Match', unit: 'moves', badge: 10, lowerIsBetter: true },
    { key: 'ttt_wins', label: 'Tic-Tac-Toe', unit: 'wins', badge: 3 },
    { key: 'whack', label: 'Whack-a-Mole', unit: 'pts', badge: 15 },
    { key: 'reaction', label: 'Reaction Test', unit: 'ms', badge: 300, lowerIsBetter: true }
  ];

  var tbody = document.getElementById('wins-body');
  var badgeWrap = document.getElementById('wins-badges');
  var emptyNote = document.getElementById('wins-empty');
  if (!tbody) return;

  var anyScore = false;
  var badgeCount = 0;

  rows.forEach(function (r) {
    var raw = get(r.key, null);
    var tr = document.createElement('tr');
    var have = raw !== null;
    if (have) anyScore = true;
    var earned = have && (r.lowerIsBetter ? Number(raw) <= r.badge : Number(raw) >= r.badge);
    if (earned) badgeCount++;
    tr.innerHTML =
      '<td>' + r.label + '</td>' +
      '<td>' + (have ? raw + ' ' + r.unit : '—') + '</td>' +
      '<td>' + (earned ? '<span class="badge badge-new">Unlocked</span>' : '<span style="color:var(--text-mute)">Locked</span>') + '</td>';
    tbody.appendChild(tr);
  });

  if (badgeWrap) badgeWrap.textContent = badgeCount + ' of ' + rows.length + ' achievements unlocked';
  if (emptyNote) emptyNote.hidden = anyScore;
})();
