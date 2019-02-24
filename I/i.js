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

function count(rows, columns, grid) {
  const startPrep = new Date();
  const offset = grid[0] === 1 ? 0 : 1;
  const l = new Uint32Array(rows * columns);
  const ur = new Uint32Array(rows * columns);
  const ul = new Uint32Array(rows * columns);
  const gridWidth = 2 * columns - 1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 2) { // '-'
      const r = Math.floor(i / gridWidth) / 2;
      const c = ((i - 1) - (r * 2 * gridWidth)) / 2;
      l[r * columns + c + 2] = l[r * columns + c] + 1;
      i += 3;
    } else if (grid[i] === 3) { // '/'
      const r = (Math.floor(i / gridWidth) - 1) / 2;
      const c = ((i + 1) - (r * 2 + 1) * gridWidth) / 2;
      ur[(r + 1) * columns + c - 1] = ur[r * columns + c] + 1;
      i++;
    } else if (grid[i] === 4) { // '\'
      const r = (Math.floor(i / gridWidth) - 1) / 2;
      const c = ((i - 1) - (r * 2 + 1) * gridWidth) / 2;
      ul[(r + 1) * columns + c + 1] = ul[r * columns + c] + 1;
      i++;
    }
  }
  console.log(`  prep time: ${new Date() - startPrep}ms`);

  const startProcess = new Date();
  const bitSeed = new Array(Math.floor((columns - 1) / 2)).fill(1);
  let result = 0;
  for (let r = 0; r < rows; r++) {
    const bit = createBIT(bitSeed);
    const events = {};
    for (let c = (r + offset) % 2; c < columns; c += 2) {
      const index = r * columns + c;
      const bitIndex = Math.floor(c / 2);
      const clearAt = bitIndex + ur[index] + 1;
      if (events[clearAt] === undefined) events[clearAt] = new Set();
      events[clearAt].add(bitIndex);
      if (events[bitIndex] !== undefined) {
        for (let event of events[bitIndex]) bit.update(event, -1);
      }
      const maxSize = Math.min(l[index], ul[index]);
      if (maxSize > 0) result += bit.rangeQuery(bitIndex - maxSize, bitIndex - 1);
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

  const startParse = new Date();
  const totals = text.substring(0, text.indexOf('\n'));
  const figure = text.substring(text.indexOf('\n') + 1);
  const [rows, columns] = totals.split(' ').map(v => parseInt(v));
  const width = 2 * columns - 1;
  const height = 2 * rows - 1;
  const grid = new Uint8Array(width * height);
  for (let i = 0, r = 0, c = 0; i < figure.length; i++, c++) {
    switch(figure.charAt(i)) {
      case '\n': r++; c = -1; break;
      case 'x': grid[r * width + c] = 1; break;
      case '-': grid[r * width + c] = 2; break;
      case '/': grid[r * width + c] = 3; break;
      case '\\': grid[r * width + c] = 4; break;
      default: break;
    }
  }
  const grid2 = new Uint8Array(grid);
  grid2.reverse();
  console.log(`  parse time: ${new Date() - startParse}ms`);

  const result = count(rows, columns, grid) + count(rows, columns, grid2);

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
