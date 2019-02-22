const fs = require('fs');
const path = require('path');

function solve(filename) {

  console.log(path.basename(filename));
  const start = new Date();

  const startRead = new Date();
  const text = fs.readFileSync(filename, 'UTF8').trim();
  console.log(`  read time: ${new Date() - startRead}ms`);

  const [wordCount, ...lines] = text.split('\n');
  const words = lines.reduce((a, l) => {
    l.split(' ').forEach(w => a.push(w.length));
    return a;
  }, []);

  const longest = words.reduce((a, w) => w > a ? w : a, 0);

  let bestRiver = 0;
  let bestWidth = longest;

  let prepTime = 0;
  let processTime = 0;

  for (let width = longest; width <= text.length; width++) {

    const startPrep = new Date();
    const rowToSpaces = [];
    let cursor = 0;
    const widthPlusOne = width + 1;
    let current = new Set();
    for (let w of words) {
      const nextCursor = cursor + w + 1;
      if (nextCursor > widthPlusOne) {
        rowToSpaces.push(current);
        current = new Set();
        cursor = w + 1;
      } else {
        current.add(cursor);
        cursor = nextCursor;
      }
    }
    rowToSpaces.push(current);
    rowToSpaces[0].delete(0);
    prepTime += new Date() - startPrep;

    const rowCount = rowToSpaces.length;
    if (rowCount <= bestRiver) break;

    const startProcess = new Date();
    for (let r = 0; r < rowCount && rowCount - r > bestRiver; r++) {
      let needOneOf = new Set();
      const spaces = rowToSpaces[r];
      if (spaces.size === 0) continue;
      for (let s of spaces) {
        needOneOf.add(s - 1);
        needOneOf.add(s);
        needOneOf.add(s + 1);
      }
      let end = false;
      let best = 1;
      for (let tr = r + 1; tr < rowCount && !end; tr++) {
        end = true;
        const currentRow = rowToSpaces[tr];
        const nextNeedOneOf = new Set();
        for (let ts of needOneOf) {
          if (currentRow.has(ts)) {
            currentRow.delete(ts);
            end = false;
            nextNeedOneOf.add(ts - 1);
            nextNeedOneOf.add(ts);
            nextNeedOneOf.add(ts + 1);
          }
        }
        needOneOf = nextNeedOneOf;
        if (!end) best++;
      }
      if (best > bestRiver) {
        bestRiver = best;
        bestWidth = width;
      }
    }
    processTime += new Date() - startProcess;
  }

  console.log(`  prep time: ${prepTime}ms`);
  console.log(`  process time: ${processTime}ms`);

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
