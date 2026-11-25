(() => {
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const levelEl = document.getElementById('level');
  const difficultyEl = document.getElementById('difficulty');
  const scoreEls = {
    X: document.getElementById('scoreX'),
    O: document.getElementById('scoreO'),
    draw: document.getElementById('scoreDraw'),
  };
  const labelX = document.getElementById('labelX');
  const labelO = document.getElementById('labelO');

  let board, current, over, mode = 'ai', starter = 'X';
  const scores = { X: 0, O: 0, draw: 0 };

  const cells = Array.from({ length: 9 }, (_, i) => {
    const b = document.createElement('button');
    b.className = 'cell';
    b.setAttribute('aria-label', `Case ${i + 1}`);
    b.addEventListener('click', () => onCellClick(i));
    boardEl.appendChild(b);
    return b;
  });

  function winnerOf(b) {
    for (const line of LINES) {
      const [a, c, d] = line;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a], line };
    }
    return b.every(Boolean) ? { player: null, line: [] } : null;
  }

  function render() {
    board.forEach((v, i) => {
      const c = cells[i];
      c.className = 'cell' + (v ? ' ' + v.toLowerCase() : '');
      c.innerHTML = v ? `<span>${v}</span>` : '';
      c.disabled = over || !!v || (mode === 'ai' && current === 'O');
      c.setAttribute('aria-label', `Case ${i + 1}${v ? ' : ' + v : ''}`);
    });
  }

  function setStatus() {
    if (mode === 'ai') {
      statusEl.textContent = current === 'X' ? 'À vous de jouer (X)' : "L'ordinateur réfléchit…";
    } else {
      statusEl.textContent = `Au tour de ${current}`;
    }
  }

  function play(i) {
    board[i] = current;
    const result = winnerOf(board);
    if (result) {
      over = true;
      if (result.player) {
        scores[result.player]++;
        statusEl.textContent = mode === 'ai'
          ? (result.player === 'X' ? 'Bravo, vous avez gagné !' : "L'ordinateur a gagné !")
          : `${result.player} a gagné !`;
      } else {
        scores.draw++;
        statusEl.textContent = 'Match nul !';
      }
      updateScores();
      render();
      result.line.forEach(k => cells[k].classList.add('win'));
      return;
    }
    current = current === 'X' ? 'O' : 'X';
    setStatus();
    render();
    if (mode === 'ai' && current === 'O') setTimeout(aiMove, 350);
  }

  function onCellClick(i) {
    if (over || board[i]) return;
    if (mode === 'ai' && current === 'O') return;
    play(i);
  }

  // --- IA ---
  function minimax(b, player, depth) {
    const r = winnerOf(b);
    if (r) {
      if (r.player === 'O') return { score: 10 - depth };
      if (r.player === 'X') return { score: depth - 10 };
      return { score: 0 };
    }
    let best = { score: player === 'O' ? -Infinity : Infinity, index: -1 };
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = player;
      const { score } = minimax(b, player === 'O' ? 'X' : 'O', depth + 1);
      b[i] = null;
      if (player === 'O' ? score > best.score : score < best.score) best = { score, index: i };
    }
    return best;
  }

  function randomMove() {
    const free = board.map((v, i) => (v ? -1 : i)).filter(i => i >= 0);
    return free[Math.floor(Math.random() * free.length)];
  }

  function aiMove() {
    if (over) return;
    const level = levelEl.value;
    let move;
    if (level === 'easy') move = randomMove();
    else if (level === 'medium') move = Math.random() < 0.5 ? randomMove() : minimax(board.slice(), 'O', 0).index;
    else move = minimax(board.slice(), 'O', 0).index;
    play(move);
  }

  // --- Contrôles ---
  function updateScores() {
    scoreEls.X.textContent = scores.X;
    scoreEls.O.textContent = scores.O;
    scoreEls.draw.textContent = scores.draw;
  }

  function newGame() {
    board = Array(9).fill(null);
    over = false;
    current = starter;
    starter = starter === 'X' ? 'O' : 'X'; // on alterne qui commence
    setStatus();
    render();
    if (mode === 'ai' && current === 'O') setTimeout(aiMove, 350);
  }

  function resetScores() {
    scores.X = scores.O = scores.draw = 0;
    updateScores();
  }

  document.querySelectorAll('.mode').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.mode === mode) return;
      mode = btn.dataset.mode;
      document.querySelectorAll('.mode').forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-checked', String(active));
      });
      difficultyEl.classList.toggle('hidden', mode !== 'ai');
      labelX.textContent = mode === 'ai' ? 'Vous (X)' : 'Joueur X';
      labelO.textContent = mode === 'ai' ? 'Ordi (O)' : 'Joueur O';
      starter = 'X';
      resetScores();
      newGame();
    });
  });

  document.getElementById('restart').addEventListener('click', newGame);
  document.getElementById('reset').addEventListener('click', () => { resetScores(); starter = 'X'; newGame(); });

  newGame();
})();
