const fs = require('fs');
const path = require('path');

const createBIT = (input) => {
  const vals = [0].concat(input);
  const count = vals.length;
  for (let i = 1; i < count; i++) {
    const i2 = i + (i & -i);
    if (i2 < count) vals[i2] += vals[i];
  }
  const prefixQuery = (i) => {
    i += 1;
    let result = 0;
    while (i) {
      result += vals[i];
      i -= i & -i;
    }
    return result;
  }
  const rangeQuery = (l, u) => {
    return prefixQuery(u) - prefixQuery(l - 1);
  }
  const update = (i, v) => {
    i += 1;
    while (i < count) {
      vals[i] += v;
      i += i & -i;
    }
  }
  return {
    prefixQuery,
    rangeQuery,
    update
  }
}

function count(rows, columns, lines) {
  const startPrep = new Date();
  const vertexes = {};
  const offset = lines[0][0] === "x" ? 0 : 1;
  for (let r = 0; r < rows; r++) {
    vertexes[r] = {};
    for (let c = (r + offset) % 2; c < columns; c += 2) {
      vertexes[r][c] = {
        l: 0,
        ul: 0,
        ur: 0
      }
    }
  }
  const horizontalLine = /---/g;
  const rightLine = /\\/g;
  const leftLine = /\//g;
  let match;
  for (let [r, line] of lines.entries()) {
    if (r % 2 === 0) {
      while (match = horizontalLine.exec(line)) {
        const startC = (match.index - 1) / 2;
        const startR = r / 2;
        vertexes[startR][startC + 2].l = vertexes[startR][startC].l + 1;
      }
    } else {
      const startR = (r - 1) / 2;
      while (match = rightLine.exec(line)) {
        const startC = (match.index - 1) / 2;
        vertexes[startR + 1][startC + 1].ul = vertexes[startR][startC].ul + 1;
      }
      while (match = leftLine.exec(line)) {
        const startC = (match.index + 1) / 2;
        vertexes[startR + 1][startC - 1].ur = vertexes[startR][startC].ur + 1;
      }
    }
  }
  console.log(`  prep time: ${new Date() - startPrep}ms`);

  const startProcess = new Date();
  const bitSeed = [];
  for (let i = 0; i < (columns + 1) / 2; i++) bitSeed.push(1);
  let result = 0;
  for (let r = 0; r < rows; r++) {
    const bit = createBIT(bitSeed);
    const events = {};
    for (let c = (r + offset) % 2; c < columns; c += 2) {
      const vertex = vertexes[r][c];
      const currentIndex = Math.floor(c / 2);
      const clearAt = currentIndex + vertex.ur + 1;
      if (events[clearAt] === undefined) events[clearAt] = new Set();
      events[clearAt].add(currentIndex);
      if (events[currentIndex] !== undefined) {
        for (let event of events[currentIndex]) bit.update(event, -1);
      }
      const maxSize = Math.min(vertex.l, vertex.ul);
      if (maxSize > 0) result += bit.rangeQuery(currentIndex - maxSize, currentIndex - 1);
    }
  }
  console.log(`  process time: ${new Date() - startProcess}ms`);

  console.log(`  result: ${result}`);
  return result;
}

function solve(filename) {

  console.log(path.basename(filename));
  const start = new Date();

  const startRead = new Date();
  const text = fs.readFileSync(filename, 'UTF8').trim();
  console.log(`  read time: ${new Date() - startRead}ms`);

  const [totals, ...lines] = text.split('\n');
  const [rows, columns] = totals.split(' ').map(v => parseInt(v));

  let result = count(rows, columns, lines);
  result += count(rows, columns,
    lines.map(r => r + ' '.repeat(columns * 2 - r.length - 1))
      .map(r => r.split('').reverse().join(''))
      .reverse()
  );

  const end = new Date();
  console.log(`  total time: ${end - start}ms`);
  if (end - start > 6000) console.log('  **************************** TOO SLOW ****************************');

  const answer = parseInt(fs.readFileSync(filename.slice(0, -3) + '.ans', { encoding: 'UTF8' }).trim());

  console.log(`  result: ${result}`);
  console.log(`  answer: ${answer}`);
  console.log(result === answer ? '  pass' : '  **************************** FAIL ****************************');
}

const inputDirectory = path.join(__dirname, '../../icpc2018data/I-triangles/');
for (let filename of fs.readdirSync(inputDirectory).filter(f => f.endsWith('.in'))) {
  solve(path.join(inputDirectory, filename));
}
// solve(path.join(inputDirectory, "sample-2.in"));
