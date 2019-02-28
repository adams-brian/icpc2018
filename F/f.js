const fs = require('fs');
const path = require('path');

function solve(filename) {

  console.log(path.basename(filename));
  const start = new Date();

  const startRead = new Date();
  const input = fs.readFileSync(filename, 'UTF8').trim();
  const text = input.substring(input.indexOf('\n') + 1);
  const words = [];
  for (let w of text.split(/\n| /)) words.push(w.length);
  let longest = 0;
  for (let w of words) longest = w > longest ? w : longest;
  console.log(`  read time: ${new Date() - startRead}ms`);

  let bestRiver = 0;
  let bestWidth = longest;

  const startProcess = new Date();
  let prev = new Uint32Array(text.length);
  let current = new Uint32Array(text.length);
  for (let width = longest; width <= text.length; width++) {
    let rows = 1;
    let cursor = words[0];
    for (let index = 1; index < words.length; index++) {
      const nextCursor = cursor + words[index] + 1;
      if (nextCursor > width) {
        for (let i = 0; i < width; i++) {
          if (prev[i] > 0) {
            if (prev[i] > bestRiver) {
              bestRiver = prev[i];
              bestWidth = width;
            }
            prev[i] = 0;
          }
        }
        const temp = current; current = prev; prev = temp;
        cursor = words[index];
        rows++;
      } else {
        current[cursor] = Math.max(prev[cursor - 1], prev[cursor], prev[cursor + 1]) + 1;
        prev[cursor - 1] = 0;
        prev[cursor] = 0;
        if (nextCursor - cursor > 2) prev[cursor + 1] = 0;
        cursor = nextCursor;
      }
    }

    for (let i = 0; i < width; i++) {
      const max = Math.max(prev[i], current[i]);
      if (max > bestRiver) {
        bestRiver = max;
        bestWidth = width;
      }
      prev[i] = 0;
      current[i] = 0;
    }

    if (rows <= bestRiver) break;
  }
  console.log(`  process time: ${new Date() - startProcess}ms`);

  const result = `${bestWidth} ${bestRiver}`;

  const end = new Date();
  console.log(`  total time: ${end - start}ms`);
  if (end - start > 12000) console.log('  **************************** TOO SLOW ****************************');

  const answer = fs.readFileSync(filename.slice(0, -3) + '.ans', { encoding: 'UTF8' }).trim();

  console.log(`  result: ${result}`);
  console.log(`  answer: ${answer}`);
  console.log(result === answer ? '  pass' : '  **************************** FAIL ****************************');
}

const inputDirectory = path.join(__dirname, '../../icpc2018data/F-gowithflow/');
for (let filename of fs.readdirSync(inputDirectory).filter(f => f.endsWith('.in'))) {
  solve(path.join(inputDirectory, filename));
}
