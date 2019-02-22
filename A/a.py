import glob, os, time

def solve(filename):
  print(filename)

  start = time.time()
  stationCount = 0
  busEvents = []
  with open(filename, "r") as file:
    for i, line in enumerate(file):
      row = line.split(' ')
      if i == 0:
        stationCount = int(row[1])
      elif i > 1:
        bus = [i -2, int(row[0]), int(row[1]), float(row[4])]
        busEvents.append([int(row[2]), bus, False])
        busEvents.append([int(row[3]), bus, True])
  print(f'  parse time: {time.time() - start}')

  startSort = time.time()
  busEvents.sort(key=lambda event: event[0])
  print(f'  sort time: {time.time() - startSort}')

  startProcess = time.time()
  probability = [0] * stationCount
  probability[1] = 1
  arrivalProbability = {}
  index = len(busEvents) - 1
  while index >= 0:
    t = busEvents[index][0]
    newProbabilities = []
    while index >= 0 and busEvents[index][0] == t:
      bus = busEvents[index][1]
      if busEvents[index][2]:
        arrivalProbability[bus[0]] = probability[bus[2]]
      else:
        newProbabilities.append([
          bus[1],
          (bus[3] * arrivalProbability[bus[0]]) + ((1 - bus[3]) * probability[bus[1]])
        ])
      index -= 1
    for newP in newProbabilities:
      if newP[1] > probability[newP[0]]:
        probability[newP[0]] = newP[1]
  p = probability[0]
  end = time.time()
  print(f'  process time: {end - startProcess}')

  
  print(f'  total time: {end - start}')
  if end - start > 10:
    print('  **************************************** TOO SLOW ****************************************')

  answerKey = 0
  with open(os.path.splitext(filename)[0] + ".ans", "r") as file:
    answerKey = float(file.read().strip())

  print(f'  result: {p}, answer: {answerKey}')

  if abs(answerKey - p) < 0.000001:
    print('  pass')
  else:
    print('  **************************************** INCORRECT ****************************************')

os.chdir("../../icpc2018data/A-catch")
for index, file in enumerate(glob.glob("*.in")):
  solve(file)
