function solve(arr) {
  const total = arr.reduce((a, c) => a + c, 0);
  const count = arr.length;
  for (let i = 0; i < total; i++) {
    for (let j = 0; j < count; j++) {
      // calculate some stuff
    }
  }
}

for (let i = 0; i < 10; i++) {
  // generate some sample data (array of 5000 random numbers 1-10)
  const data = [];
  for (let i = 0; i < 5000; i++) {
    data.push(Math.floor(Math.random() * 10) + 1);
  }

  const start = new Date();
  solve(data);  // run solve on the data
  console.log(`${i + 1}: ${new Date() - start}ms`);
}
