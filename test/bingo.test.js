const test = require('node:test');
const assert = require('node:assert/strict');
const bingo = require('../games/bingo');

const ordered = Array.from({ length: 25 }, (_, i) => i + 1);

function prepared(a = ordered, b = [...ordered].reverse(), first = 0) {
  const state = bingo.init(first);
  assert.equal(bingo.move(state, 0, { board: a }), null);
  assert.equal(bingo.move(state, 1, { board: b }), null);
  return state;
}

function markDirectly(state, numbers, turn = 0) {
  state.marked = [...numbers];
  state.history = [...numbers];
  state.turn = turn;
}

test('requires a complete permutation of 1 through 25', () => {
  const state = bingo.init();
  assert.equal(bingo.move(state, 0, { board: ordered.slice(0, 24) }), 'badBoard');
  assert.equal(bingo.move(state, 0, { board: [...ordered.slice(0, 24), 25.5] }), 'badBoardNumber');
  assert.equal(bingo.move(state, 0, { board: [...ordered.slice(0, 24), 24] }), 'duplicateBoardNumber');
  assert.equal(bingo.move(state, 0, { board: ordered }), null);
  assert.equal(bingo.move(state, 0, { board: ordered }), 'chosen');
});

test('keeps boards private before the round ends and starts on the configured player', () => {
  const state = prepared(ordered, [...ordered].reverse(), 1);
  assert.equal(state.phase, 'playing');
  assert.equal(state.turn, 1);
  const view = bingo.view(state, 0);
  assert.deepEqual(view.board, ordered);
  assert.equal(view.opponentBoard, null);
  assert.equal(Object.hasOwn(view, 'boards'), false);
});

test('rejects moves before preparation, out of turn, invalid and repeated numbers', () => {
  const state = bingo.init();
  assert.equal(bingo.move(state, 0, { number: 1 }), 'badBoard');
  const playing = prepared();
  assert.equal(bingo.move(playing, 1, { number: 1 }), 'notTurn');
  assert.equal(bingo.move(playing, 0, { number: 1.5 }), 'badNumber');
  assert.equal(bingo.move(playing, 0, { number: 0 }), 'badNumber');
  assert.equal(bingo.move(playing, 0, { number: 1 }), null);
  assert.equal(bingo.move(playing, 1, { number: 1 }), 'takenNumber');
});

test('counts a completed row, column and diagonal exactly once', () => {
  let state = prepared();
  markDirectly(state, [1, 2, 3, 4], 0);
  assert.equal(bingo.move(state, 0, { number: 5 }), null);
  assert.deepEqual(state.completedLines[0], [0]);

  state = prepared();
  markDirectly(state, [1, 6, 11, 16], 0);
  assert.equal(bingo.move(state, 0, { number: 21 }), null);
  assert.deepEqual(state.completedLines[0], [5]);

  state = prepared();
  markDirectly(state, [1, 7, 13, 19], 0);
  assert.equal(bingo.move(state, 0, { number: 25 }), null);
  assert.deepEqual(state.completedLines[0], [10]);
});

test('a single call can increase a player from four lines to six and win', () => {
  const missing = new Set([13, 17, 20, 22, 25]);
  const rest = ordered.filter((n) => !missing.has(n));
  const opponent = [17, 20, 22, 13, ...rest.slice(0, 4), 25, ...rest.slice(4)];
  const state = prepared(ordered, opponent);
  const before = [
    1, 2, 3, 4, 5,
    6, 7, 8, 9, 10,
    11, 12, 14, 15,
    16, 18, 19, 21, 23, 24,
  ];
  markDirectly(state, before, 0);
  assert.equal(bingo.move(state, 0, { number: 13 }), null);
  assert.equal(state.bingoCounts[0], 6);
  assert.equal(state.over, true);
  assert.equal(state.winner, 0);
  assert.equal(bingo.view(state, 0).opponentBoard.length, 25);
});

test('draws when both players reach five or more lines on the same call', () => {
  const state = prepared(ordered, ordered);
  let n = 1;
  while (!state.over) {
    assert.equal(bingo.move(state, (n - 1) % 2, { number: n }), null);
    n++;
  }
  assert.equal(state.over, true);
  assert.equal(state.winner, null);
  assert.ok(state.bingoCounts[0] >= 5);
  assert.equal(state.bingoCounts[0], state.bingoCounts[1]);
});

test('reveals both completed lines and blocks further moves after the round ends', () => {
  const state = prepared();
  markDirectly(state, ordered.slice(0, 24), 0);
  assert.equal(bingo.move(state, 0, { number: 25 }), null);
  const view = bingo.view(state, 1);
  assert.deepEqual(view.opponentBoard, ordered);
  assert.equal(view.opponentCompletedLines.length, 12);
  assert.equal(bingo.move(state, 1, { number: 1 }), 'over');
});
