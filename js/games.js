(function () {
  'use strict';

  /* ---------- Tabs (WAI-ARIA tabs pattern) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var initialized = {};

  function selectTab(tab) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    tab.focus();
    var key = tab.id;
    if (!initialized[key] && window.RaxiGames && window.RaxiGames[key]) {
      window.RaxiGames[key]();
      initialized[key] = true;
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var idx = i;
      if (e.key === 'ArrowRight') idx = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') idx = (i - 1 + tabs.length) % tabs.length;
      else return;
      e.preventDefault();
      selectTab(tabs[idx]);
    });
  });

  if (tabs.length) {
    var first = tabs[0];
    if (window.RaxiGames && window.RaxiGames[first.id]) {
      window.RaxiGames[first.id]();
      initialized[first.id] = true;
    }
  }

  function bestKey(name) { return 'raxi_best_' + name; }
  function getBest(name, fallback) {
    var v = localStorage.getItem(bestKey(name));
    return v === null ? fallback : Number(v);
  }
  function setBest(name, value) {
    localStorage.setItem(bestKey(name), String(value));
  }

  window.RaxiGames = window.RaxiGames || {};

  /* ---------- Snake ---------- */
  window.RaxiGames['tab-snake'] = function () {
    var canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var size = 20, cell = canvas.width / size;
    var snake, dir, nextDir, food, score, running, loopId, speedMs;
    var scoreEl = document.getElementById('snake-score');
    var bestEl = document.getElementById('snake-best');
    var statusEl = document.getElementById('snake-status');
    var startBtn = document.getElementById('snake-start');

    bestEl.textContent = getBest('snake', 0);

    function reset() {
      snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      dir = { x: 1, y: 0 };
      nextDir = dir;
      score = 0;
      placeFood();
      scoreEl.textContent = score;
      draw();
    }

    function placeFood() {
      do {
        food = { x: (Math.random() * size) | 0, y: (Math.random() * size) | 0 };
      } while (snake.some(function (s) { return s.x === food.x && s.y === food.y; }));
    }

    function draw() {
      ctx.fillStyle = '#121012';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffb020';
      ctx.fillRect(food.x * cell, food.y * cell, cell - 2, cell - 2);
      snake.forEach(function (s, i) {
        ctx.fillStyle = i === 0 ? '#ff3049' : '#cf1130';
        ctx.fillRect(s.x * cell, s.y * cell, cell - 2, cell - 2);
      });
    }

    function tick() {
      dir = nextDir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= size || head.y >= size ||
        snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
        gameOver();
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        placeFood();
      } else {
        snake.pop();
      }
      draw();
    }

    function gameOver() {
      running = false;
      clearInterval(loopId);
      statusEl.textContent = 'Game over — score ' + score + '. Press Start to play again.';
      startBtn.textContent = 'Restart';
      if (score > getBest('snake', 0)) {
        setBest('snake', score);
        bestEl.textContent = score;
        statusEl.textContent += ' New best score!';
      }
    }

    function start() {
      reset();
      running = true;
      statusEl.textContent = 'Playing — use arrow keys or WASD.';
      startBtn.textContent = 'Restart';
      clearInterval(loopId);
      loopId = setInterval(tick, 130);
    }

    startBtn.addEventListener('click', start);
    document.addEventListener('keydown', function (e) {
      if (!running) return;
      var map = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
      };
      var d = map[e.key];
      if (!d) return;
      if (d.x === -dir.x && d.y === -dir.y) return;
      nextDir = d;
      e.preventDefault();
    });

    reset();
  };

  /* ---------- 2048 ---------- */
  window.RaxiGames['tab-2048'] = function () {
    var boardEl = document.getElementById('t2048-board');
    if (!boardEl) return;
    var scoreEl = document.getElementById('t2048-score');
    var bestEl = document.getElementById('t2048-best');
    var statusEl = document.getElementById('t2048-status');
    var restartBtn = document.getElementById('t2048-restart');
    var grid, score;
    bestEl.textContent = getBest('2048', 0);

    function emptyGrid() { return Array.from({ length: 4 }, function () { return [0, 0, 0, 0]; }); }

    function addTile() {
      var empties = [];
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (grid[r][c] === 0) empties.push([r, c]);
      if (!empties.length) return;
      var pick = empties[(Math.random() * empties.length) | 0];
      grid[pick[0]][pick[1]] = Math.random() < 0.9 ? 2 : 4;
    }

    function render() {
      boardEl.innerHTML = '';
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
          var v = grid[r][c];
          var cellDiv = document.createElement('div');
          cellDiv.className = 't2048-cell' + (v ? ' filled v' + v : '');
          cellDiv.textContent = v || '';
          boardEl.appendChild(cellDiv);
        }
      }
      scoreEl.textContent = score;
    }

    function slideRow(row) {
      var vals = row.filter(function (v) { return v !== 0; });
      for (var i = 0; i < vals.length - 1; i++) {
        if (vals[i] === vals[i + 1]) {
          vals[i] *= 2;
          score += vals[i];
          vals.splice(i + 1, 1);
        }
      }
      while (vals.length < 4) vals.push(0);
      return vals;
    }

    function rotate(g) {
      var res = emptyGrid();
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) res[c][3 - r] = g[r][c];
      return res;
    }

    function move(dir) {
      var g = grid;
      var rotations = { left: 0, up: 1, right: 2, down: 3 }[dir];
      for (var i = 0; i < rotations; i++) g = rotate(g);
      var moved = false;
      var newGrid = [];
      for (var r = 0; r < 4; r++) {
        var slid = slideRow(g[r]);
        if (slid.join() !== g[r].join()) moved = true;
        newGrid.push(slid);
      }
      g = newGrid;
      for (var j = 0; j < (4 - rotations) % 4; j++) g = rotate(g);
      grid = g;
      if (moved) {
        addTile();
        render();
        checkEnd();
      }
    }

    function canMove() {
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        if (grid[r][c] === 0) return true;
        if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
        if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
      }
      return false;
    }

    function checkEnd() {
      if (!canMove()) {
        statusEl.textContent = 'No more moves — final score ' + score + '.';
        if (score > getBest('2048', 0)) {
          setBest('2048', score);
          bestEl.textContent = score;
          statusEl.textContent += ' New best score!';
        }
      } else {
        statusEl.textContent = 'Use arrow keys to combine tiles and reach 2048.';
      }
    }

    function restart() {
      grid = emptyGrid();
      score = 0;
      addTile(); addTile();
      render();
      statusEl.textContent = 'Use arrow keys to combine tiles and reach 2048.';
    }

    document.addEventListener('keydown', function (e) {
      var panel = document.getElementById('panel-2048');
      if (panel.hidden) return;
      var map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    });
    restartBtn.addEventListener('click', restart);
    restart();
  };

  /* ---------- Memory Match ---------- */
  window.RaxiGames['tab-memory'] = function () {
    var boardEl = document.getElementById('memory-board');
    if (!boardEl) return;
    var movesEl = document.getElementById('memory-moves');
    var bestEl = document.getElementById('memory-best');
    var statusEl = document.getElementById('memory-status');
    var restartBtn = document.getElementById('memory-restart');
    var symbols = ['🎮', '🕹️', '🏆', '⚡', '🎯', '🔥'];
    var first = null, lock = false, moves = 0, matched = 0;

    bestEl.textContent = getBest('memory_moves', '—');

    function shuffle(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = (Math.random() * (i + 1)) | 0;
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    }

    function build() {
      var deck = shuffle(symbols.concat(symbols).map(function (s, i) { return { s: s, id: i }; }));
      boardEl.innerHTML = '';
      first = null; lock = false; moves = 0; matched = 0;
      movesEl.textContent = 0;
      statusEl.textContent = 'Find all 6 matching pairs.';
      deck.forEach(function (card) {
        var btn = document.createElement('button');
        btn.className = 'memory-card';
        btn.setAttribute('aria-label', 'Hidden card');
        btn.dataset.symbol = card.s;
        btn.textContent = '?';
        btn.addEventListener('click', function () { flip(btn); });
        boardEl.appendChild(btn);
      });
    }

    function flip(btn) {
      if (lock || btn.classList.contains('matched') || btn === first) return;
      btn.textContent = btn.dataset.symbol;
      btn.classList.add('flipped');
      btn.setAttribute('aria-label', btn.dataset.symbol);
      if (!first) { first = btn; return; }
      moves++;
      movesEl.textContent = moves;
      if (first.dataset.symbol === btn.dataset.symbol) {
        first.classList.add('matched');
        btn.classList.add('matched');
        matched++;
        first = null;
        if (matched === symbols.length) finish();
      } else {
        lock = true;
        setTimeout(function () {
          first.textContent = '?';
          first.setAttribute('aria-label', 'Hidden card');
          first.classList.remove('flipped');
          btn.textContent = '?';
          btn.setAttribute('aria-label', 'Hidden card');
          btn.classList.remove('flipped');
          first = null;
          lock = false;
        }, 700);
      }
    }

    function finish() {
      statusEl.textContent = 'Solved in ' + moves + ' moves!';
      var best = getBest('memory_moves', Infinity);
      if (moves < best) {
        setBest('memory_moves', moves);
        bestEl.textContent = moves;
        statusEl.textContent += ' New best!';
      }
    }

    restartBtn.addEventListener('click', build);
    build();
  };

  /* ---------- Tic-Tac-Toe ---------- */
  window.RaxiGames['tab-ttt'] = function () {
    var boardEl = document.getElementById('ttt-board');
    if (!boardEl) return;
    var statusEl = document.getElementById('ttt-status');
    var winsEl = document.getElementById('ttt-wins');
    var restartBtn = document.getElementById('ttt-restart');
    var cells, active;
    var wins = getBest('ttt_wins', 0);
    winsEl.textContent = wins;

    var LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    function winner(b) {
      for (var i = 0; i < LINES.length; i++) {
        var l = LINES[i];
        if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]];
      }
      return b.every(function (v) { return v; }) ? 'draw' : null;
    }

    function build() {
      cells = Array(9).fill(null);
      active = true;
      boardEl.innerHTML = '';
      statusEl.textContent = 'Your move — you are X.';
      for (var i = 0; i < 9; i++) {
        var btn = document.createElement('button');
        btn.className = 'ttt-cell';
        btn.setAttribute('aria-label', 'Cell ' + (i + 1));
        (function (idx) {
          btn.addEventListener('click', function () { playerMove(idx); });
        })(i);
        boardEl.appendChild(btn);
      }
    }

    function render() {
      Array.prototype.forEach.call(boardEl.children, function (btn, i) {
        btn.textContent = cells[i] || '';
      });
    }

    function playerMove(idx) {
      if (!active || cells[idx]) return;
      cells[idx] = 'X';
      render();
      var w = winner(cells);
      if (w) return endGame(w);
      setTimeout(cpuMove, 350);
    }

    function cpuMove() {
      if (!active) return;
      var open = cells.map(function (v, i) { return v ? null : i; }).filter(function (v) { return v !== null; });
      var move = open[(Math.random() * open.length) | 0];
      cells[move] = 'O';
      render();
      var w = winner(cells);
      if (w) endGame(w);
    }

    function endGame(w) {
      active = false;
      if (w === 'draw') statusEl.textContent = "It's a draw. Press Restart to play again.";
      else if (w === 'X') {
        statusEl.textContent = 'You win! Press Restart to play again.';
        wins++;
        setBest('ttt_wins', wins);
        winsEl.textContent = wins;
      } else {
        statusEl.textContent = 'Raxi CPU wins this round. Press Restart to try again.';
      }
    }

    restartBtn.addEventListener('click', build);
    build();
  };

  /* ---------- Whack-a-Mole ---------- */
  window.RaxiGames['tab-whack'] = function () {
    var boardEl = document.getElementById('whack-board');
    if (!boardEl) return;
    var scoreEl = document.getElementById('whack-score');
    var bestEl = document.getElementById('whack-best');
    var timeEl = document.getElementById('whack-time');
    var startBtn = document.getElementById('whack-start');
    var holes, activeHole, score, timeLeft, moleTimer, countdown, running;

    bestEl.textContent = getBest('whack', 0);

    function build() {
      boardEl.innerHTML = '';
      holes = [];
      for (var i = 0; i < 9; i++) {
        var hole = document.createElement('button');
        hole.className = 'whack-hole';
        hole.setAttribute('aria-label', 'Hole ' + (i + 1) + ', empty');
        (function (idx) { hole.addEventListener('click', function () { hit(idx); }); })(i);
        boardEl.appendChild(hole);
        holes.push(hole);
      }
    }

    function popMole() {
      if (activeHole !== undefined && holes[activeHole]) {
        holes[activeHole].classList.remove('up');
        holes[activeHole].setAttribute('aria-label', 'Hole, empty');
      }
      activeHole = (Math.random() * holes.length) | 0;
      holes[activeHole].classList.add('up');
      holes[activeHole].setAttribute('aria-label', 'Hole, mole up — click to score');
    }

    function hit(idx) {
      if (!running) return;
      if (idx === activeHole) {
        score++;
        scoreEl.textContent = score;
        holes[idx].classList.remove('up');
        holes[idx].setAttribute('aria-label', 'Hole, empty');
        activeHole = undefined;
      }
    }

    function start() {
      build();
      score = 0; timeLeft = 30; running = true;
      scoreEl.textContent = 0;
      timeEl.textContent = timeLeft;
      startBtn.textContent = 'Restart';
      clearInterval(moleTimer); clearInterval(countdown);
      moleTimer = setInterval(popMole, 750);
      countdown = setInterval(function () {
        timeLeft--;
        timeEl.textContent = timeLeft;
        if (timeLeft <= 0) end();
      }, 1000);
    }

    function end() {
      running = false;
      clearInterval(moleTimer);
      clearInterval(countdown);
      holes.forEach(function (h) { h.classList.remove('up'); });
      if (score > getBest('whack', 0)) {
        setBest('whack', score);
        bestEl.textContent = score;
      }
    }

    startBtn.addEventListener('click', start);
    build();
  };

  /* ---------- Reaction Test ---------- */
  window.RaxiGames['tab-reaction'] = function () {
    var box = document.getElementById('reaction-box');
    if (!box) return;
    var bestEl = document.getElementById('reaction-best');
    var resultEl = document.getElementById('reaction-result');
    var state = 'idle', timeoutId, startTime;

    bestEl.textContent = getBest('reaction', '—') === '—' ? '—' : getBest('reaction') + ' ms';

    function reset(msg) {
      state = 'idle';
      box.className = 'reaction-box idle';
      box.textContent = msg || 'Click to start';
    }

    box.addEventListener('click', function () {
      if (state === 'idle') {
        state = 'waiting';
        box.className = 'reaction-box waiting';
        box.textContent = 'Wait for green…';
        var delay = 1000 + Math.random() * 2500;
        timeoutId = setTimeout(function () {
          state = 'go';
          startTime = performance.now();
          box.className = 'reaction-box go';
          box.textContent = 'Click now!';
        }, delay);
      } else if (state === 'waiting') {
        clearTimeout(timeoutId);
        resultEl.textContent = 'Too soon! Wait for green next time.';
        reset('Click to try again');
      } else if (state === 'go') {
        var ms = Math.round(performance.now() - startTime);
        resultEl.textContent = 'Reaction time: ' + ms + ' ms';
        var best = getBest('reaction', Infinity);
        if (ms < best) {
          setBest('reaction', ms);
          bestEl.textContent = ms + ' ms';
          resultEl.textContent += ' — new best!';
        }
        reset('Click to try again');
      }
    });
  };
})();
