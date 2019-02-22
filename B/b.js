const fs = require('fs');
const path = require('path');

function solve(filename) {

  console.log(path.basename(filename));
  const start = new Date();

  const startRead = new Date();
  const text = fs.readFileSync(filename, 'UTF8').trim();
  console.log(`  read time: ${new Date() - startRead}ms`);

  const startProcess = new Date();
  const wordList = [];
  const words = new Set();
  
  for (const val of text.split(' ')) {
    const lastChar = val[val.length - 1];
    const comma = lastChar === ',';
    const period = lastChar === '.';
    const word = comma || period ? val.substring(0, val.length - 1) : val;

    wordList.push({
      comma,
      period,
      word
    });
    words.add(word);
  }

  const wordToPrevious = {};
  const wordToNext = {};
  for (const word of words) {
    wordToPrevious[word] = new Set();
    wordToNext[word] = new Set();
  }

  const newAfter = new Set();
  const newBefore = new Set();
  const wordCount = wordList.length;
  for (let i=0; i<wordCount; i++) {
    const current = wordList[i];
    if (i > 0) {
      const prev = wordList[i-1];
      if (!prev.period) wordToPrevious[current.word].add(prev.word);
      if (prev.comma) newBefore.add(current.word);
    }
    if (!current.period && i < wordCount - 1) {
      wordToNext[current.word].add(wordList[i+1].word);
    }
    if (current.comma) newAfter.add(current.word);
  }

  const commaAfter = new Set();
  const commaBefore = new Set();
  while (newAfter.size > 0 || newBefore.size > 0) {
    newAfter.forEach((word) => {
      commaAfter.add(word);
      wordToNext[word].forEach(w => newBefore.add(w));
      wordToNext[word].clear();
      newAfter.delete(word);
    });
    newBefore.forEach((word) => {
      commaBefore.add(word);
      wordToPrevious[word].forEach(w => newAfter.add(w));
      wordToPrevious[word].clear();
      newBefore.delete(word);
    })
  }

  for (let i=0; i<wordCount; i++) {
    const entry = wordList[i];
    const word = entry.word;
    if (commaAfter.has(word)) entry.comma = true;
    if (commaBefore.has(word) && i > 0) wordList[i - 1].comma = true;
  }

  const result = wordList.map((e) => e.word + (e.period ? '.' : e.comma ? ',' : '')).join(' ');

  const end = new Date();
  console.log(`  process time: ${end - startProcess}ms`);
  console.log(`  total time: ${end - start}ms`);
  if (end - start > 8000) console.log('  **************************** TOO SLOW ****************************');

  const answer = fs.readFileSync(filename.slice(0, -3) + '.ans', { encoding: 'UTF8' }).trim();

  const printLength = 80;
  console.log(`  result: ${result.substring(0, printLength)}${result.length > printLength ? '...' : ''}`);
  console.log(`  answer: ${answer.substring(0, printLength)}${result.length > printLength ? '...' : ''}`);
  console.log(result === answer ? '  pass' : '  **************************** FAIL ****************************');
}

const inputDirectory = path.join(__dirname, '../../icpc2018data/B-comma/');
for (let filename of fs.readdirSync(inputDirectory).filter(f => f.endsWith('.in'))) {
  solve(path.join(inputDirectory, filename));
}
