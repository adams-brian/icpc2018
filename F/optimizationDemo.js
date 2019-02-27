function solve(arr) {
  const total = arr.reduce((p, c) => p + c, 0);
  const count = arr.length;
  for (let i = 0; i < total; i++) {
    for (let j = 0; j < count; j++) {
      // calculate some stuff
    }
  }
}

for (let i = 0; i < 10; i++) {
  // generate sample data (array of 5000 random numbers 1-10)
  const a = [];
  for (let i = 0; i < 5000; i++) {
    a.push(Math.floor(Math.random() * 9.999) + 1);
  }

  const start = new Date();
  solve(a);
  console.log(`${i + 1}: ${new Date() - start}ms`);
}
