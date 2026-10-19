const WORDS = [
  'APPLE', 'BRAVE', 'CHAIR', 'DRIVE', 'EAGLE', 'FLAME', 'GHOST', 'HOUSE',
  'IMAGE', 'JUICE', 'KNIFE', 'LIGHT', 'MONEY', 'NIGHT', 'OCEAN', 'PIANO',
  'QUEEN', 'RIVER', 'SMILE', 'TABLE', 'UNCLE', 'VOICE', 'WATER', 'YOUNG',
  'ZEBRA', 'BREAD', 'CLOUD', 'DREAM', 'EARTH', 'FRUIT', 'GRAPE', 'HONEY',
  'JOKER', 'KARMA', 'LEMON', 'MAGIC', 'NOBLE', 'OLIVE', 'PEACH', 'QUILT',
  'RADIO', 'SUGAR', 'TIGER', 'URBAN', 'VIVID', 'WHEAT', 'YACHT', 'ZESTY',
];

const ROWS = 6;
const LENGTH = 5;
const KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

const boardEl = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const messageEl = document.getElementById('message');
const newBtn = document.getElementById('newBtn');

let answer = '';
let row = 0;
let col = 0;
let current = '';
let done = false;
let tiles = [];
let keyState = {};

function pickWord() {
  let next = answer;
  while (next === answer) {
    next = WORDS[Math.floor(Math.random() * WORDS.length)];
  }
  return next;
}

function buildBoard() {
  boardEl.innerHTML = '';
  tiles = [];

  for (let r = 0; r < ROWS; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    const rowTiles = [];

    for (let c = 0; c < LENGTH; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      rowEl.appendChild(tile);
      rowTiles.push(tile);
    }

    boardEl.appendChild(rowEl);
    tiles.push(rowTiles);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = '';

  KEYS.forEach((letters, index) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'key-row';

    if (index === 2) {
      const enter = document.createElement('button');
      enter.type = 'button';
      enter.className = 'key wide';
      enter.dataset.key = 'ENTER';
      enter.textContent = 'ENTER';
      enter.addEventListener('click', () => press('ENTER'));
      rowEl.appendChild(enter);
    }

    letters.split('').forEach((letter) => {
      const key = document.createElement('button');
      key.type = 'button';
      key.className = 'key';
      key.dataset.key = letter;
      key.textContent = letter;
      key.addEventListener('click', () => press(letter));
      rowEl.appendChild(key);
    });

    if (index === 2) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'key wide';
      back.dataset.key = 'BACK';
      back.textContent = 'DEL';
      back.addEventListener('click', () => press('BACK'));
      rowEl.appendChild(back);
    }

    keyboardEl.appendChild(rowEl);
  });
}

function showMessage(text, tone) {
  messageEl.textContent = text;
  messageEl.className = 'message' + (tone ? ` ${tone}` : '');
  messageEl.hidden = false;
}

function updateRow() {
  const rowTiles = tiles[row];
  rowTiles.forEach((tile, index) => {
    const letter = current[index] || '';
    tile.textContent = letter;
    tile.classList.toggle('filled', letter !== '');
  });
}

function evaluate(guess) {
  const result = Array(LENGTH).fill('absent');
  const counts = {};

  for (let i = 0; i < LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
    } else {
      counts[answer[i]] = (counts[answer[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < LENGTH; i++) {
    if (result[i] === 'correct') continue;
    const letter = guess[i];
    if (counts[letter] > 0) {
      result[i] = 'present';
      counts[letter]--;
    }
  }

  return result;
}

function paintKeyboard(guess, result) {
  const rank = { absent: 1, present: 2, correct: 3 };

  guess.split('').forEach((letter, index) => {
    const status = result[index];
    const previous = keyState[letter];

    if (!previous || rank[status] > rank[previous]) {
      keyState[letter] = status;
    }
  });

  keyboardEl.querySelectorAll('.key').forEach((key) => {
    const status = keyState[key.dataset.key];
    if (!status) return;
    key.classList.remove('absent', 'present', 'correct');
    key.classList.add(status);
  });
}

function submit() {
  if (done) return;

  if (current.length < LENGTH) {
    showMessage('Not enough letters.', 'error');
    shake();
    return;
  }

  if (!WORDS.includes(current)) {
    showMessage('That word is not on the list.', 'error');
    shake();
    return;
  }

  const result = evaluate(current);
  const rowTiles = tiles[row];

  rowTiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.remove('filled');
      tile.classList.add(result[index]);
    }, index * 120);
  });

  paintKeyboard(current, result);

  const won = current === answer;

  row++;
  col = 0;
  current = '';

  if (won) {
    done = true;
    setTimeout(() => showMessage(`You got it in ${row} ${row === 1 ? 'try' : 'tries'}.`, 'win'), LENGTH * 120 + 80);
    return;
  }

  if (row === ROWS) {
    done = true;
    setTimeout(() => showMessage(`Out of tries. The word was ${answer}.`, 'error'), LENGTH * 120 + 80);
    return;
  }

  showMessage('');
  messageEl.hidden = true;
}

function shake() {
  const rowEl = tiles[row][0].parentElement;
  rowEl.classList.remove('shake');
  void rowEl.offsetWidth;
  rowEl.classList.add('shake');
}

function press(key) {
  if (done) return;

  if (key === 'ENTER') {
    submit();
    return;
  }

  if (key === 'BACK') {
    if (col > 0) {
      col--;
      current = current.slice(0, -1);
      updateRow();
    }
    return;
  }

  if (/^[A-Z]$/.test(key) && col < LENGTH) {
    current += key;
    col++;
    updateRow();
  }
}

function newGame() {
  answer = pickWord();
  row = 0;
  col = 0;
  current = '';
  done = false;
  keyState = {};
  messageEl.hidden = true;
  messageEl.className = 'message';

  buildBoard();
  keyboardEl.querySelectorAll('.key').forEach((key) => {
    key.classList.remove('absent', 'present', 'correct');
  });
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key === 'Enter') {
    press('ENTER');
    event.preventDefault();
    return;
  }

  if (event.key === 'Backspace') {
    press('BACK');
    event.preventDefault();
    return;
  }

  const letter = event.key.toUpperCase();
  if (/^[A-Z]$/.test(letter)) press(letter);
});

newBtn.addEventListener('click', newGame);

buildKeyboard();
newGame();
