const fs = require('fs');
const path = require('path');

function solve(filename) {

  console.log(path.basename(filename));
  const start = new Date();

  const startRead = new Date();
  const [totals, arrive, ...busLines] = fs.readFileSync(filename, 'UTF8').trim().split('\n');
  console.log(`  read time: ${new Date() - startRead}ms`);
  const startParse = new Date();
  const stationCount = parseInt(totals.split(' ')[1]);
  const busEvents = [];
  for (const [index, line] of busLines.entries()) {
    const b = line.split(' ');
    const bus = {
      id: index,
      o: parseInt(b[0]),
      d: parseInt(b[1]),
      p: parseFloat(b[4])
    };
    const b2i = b[2].length - 9;
    busEvents.push({
      t0: b2i > 0 ? parseInt(b[2].substring(0, b2i)) : 0,
      t1: parseInt(b[2].substring(b2i)),
      bus,
      a: false});
    const b3i = b[3].length - 9;
    busEvents.push({
      t0: b3i > 0 ? parseInt(b[3].substring(0, b3i)) : 0,
      t1: parseInt(b[3].substring(b3i)),
      bus,
      a: true});
  }
  console.log(`  parse time: ${new Date() - startParse}ms`);
  const startSort = new Date();
  busEvents.sort((a, b) =>
    a.t0 > b.t0 ? 1 :
      a.t0 < b.t0 ? -1 :
        a.t1 > b.t1 ? 1 :
          a.t1 < b.t1 ? -1 : 0
  );
  console.log(`  sort time: ${new Date() - startSort}ms`);

  const startProcess = new Date();
  const probability = {};
  for (let i = 0; i < stationCount; i++) {
    probability[i] = 0;
  }
  probability[1] = 1;
  const arrivalProbability = {};

  let index = busEvents.length - 1;
  while (index >= 0) {
    const t0 = busEvents[index].t0;
    const t1 = busEvents[index].t1;
    const newProbabilities = [];
    while (index >= 0 && busEvents[index].t1 === t1 && busEvents[index].t0 === t0) {
      const bus = busEvents[index].bus;
      if (busEvents[index].a) {
        arrivalProbability[bus.id] = probability[bus.d];
      } else {
        newProbabilities.push({
          o: bus.o,
          p: (bus.p * arrivalProbability[bus.id]) + ((1 - bus.p) * probability[bus.o])
        });
      }
      index--;
    }
    for (let newP of newProbabilities) {
      if (newP.p > probability[newP.o]) probability[newP.o] = newP.p;
    }
  }
  const end = new Date();
  console.log(`  process time: ${end - startProcess}ms`);
  console.log(`  total time: ${end - start}ms`);
  if (end - start > 10000) console.log('  **************************** TOO SLOW ****************************');

  const result = probability[0];
  const answer = parseFloat(fs.readFileSync(filename.slice(0, -3) + '.ans', { encoding: 'UTF8' }).trim());

  console.log(`  result: ${result}, answer: ${answer}`)
  console.log(Math.abs(result - answer) < 0.000001 ? '  pass' : '  **************************** FAIL ****************************');
}

const inputDirectory = '../../icpc2018data/A-catch/';
for (let filename of fs.readdirSync(inputDirectory).filter(f => f.endsWith('.in'))) {
  solve(path.join(inputDirectory, filename));
}
