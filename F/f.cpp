#include <iostream>
#include <fstream>
#include <vector>
#include <list>
#include <map>
#include <tuple>
#include <unordered_set>
#include <exception>
#include <dirent.h>
#include <string>
#include <sstream>
#include <algorithm>
#include <iterator>
#include <set>

using namespace std;

vector<string> readFile(string filename) {
  ifstream inFile;

  inFile.open(filename);
  if (!inFile) {
      cout << "Unable to open file: " << filename << endl;
      throw exception();
  }
  
  vector<string> lines;
  string line;
  while (getline(inFile, line))
  {
    lines.push_back(line);
  }

  inFile.close();

  return lines;
}

void solve(string filename) {
  vector<string> lines = readFile(filename);
  vector<int> words;
  for (int index = 0; index < lines.size(); index++) {
    string line = lines[index];
    if (index == 0) {
      continue;
    }
    else
    {
      istringstream iss(line);
      vector<string> tokens{istream_iterator<string>{iss}, istream_iterator<string>{}};
      for (int j = 0; j < tokens.size(); j++) {
        words.push_back(tokens[j].length());
      }      
    }
  }
  int longest = 0;
  int totalLength = 0;
  for (int j = 0; j < words.size(); j++) {
    if (words[j] > longest) longest = words[j];
    totalLength += words[j] + 1;
  }

  int bestRiver = 0;
  int bestWidth = longest;

  for (int width = longest; width <= totalLength; width++) {

    vector<vector<int>> rowToSpaces;

    int row = 0;
    int cursor = 0;
    rowToSpaces.push_back(vector<int>());
    for (int i = 0; i < words.size(); i++) {
      int w = words[i];
      if (cursor + w > width) {
        row++;
        rowToSpaces.push_back(vector<int>());
        cursor = w + 1;
      } else {
        if (cursor > 0) rowToSpaces[row].push_back(cursor);
        cursor += w + 1;
      }
    }

    int rowCount = row + 1;

    if (rowCount <= bestRiver) break;

    map<int, int> rivers;

    for (int i = 0; i < rowCount; i++) {
      map<int, int> newRivers;
      int bestThisLine = 0;
      for (int j = 0; j < rowToSpaces[i].size(); j++) {
        int s = rowToSpaces[i][j];
        int thisRiver = max(
          (rivers.find(s - 1) == rivers.end()) ? 0 : rivers[s - 1],
          (rivers.find(s) == rivers.end()) ? 0 : rivers[s]
        );
        thisRiver = max(
          thisRiver,
          (rivers.find(s + 1) == rivers.end()) ? 0 : rivers[s + 1]
        );
        thisRiver += 1;
        if (thisRiver > bestRiver) {
          bestRiver = thisRiver;
          bestWidth = width;
        }
        newRivers.insert(make_pair(s, thisRiver));
        bestThisLine = thisRiver > bestThisLine ? thisRiver : bestThisLine;
      }
      if (bestThisLine + (rowCount - i) <= bestRiver) break;
      rivers = newRivers;
    }
  }

  string answer = to_string(bestWidth) + " " + to_string(bestRiver);
  cout << answer << endl;

  string answerKeyFilename = filename.substr(0, filename.length() - 2) + "ans";
  string answerKey = readFile(answerKeyFilename)[0];
  cout << answerKey << endl;

  if (answer == answerKey) {
    cout << "correct!" << endl;
  }
  else {
    cout << "------------------------------------------ INCORRECT ------------------------------------------" << endl;
  }  
}

int main() {
  struct dirent *pDirent;
  DIR *pDir;
  pDir = opendir ("../../icpc2018data/F-gowithflow");
  if (pDir == NULL) {
      printf ("Cannot open directory\n");
      return 1;
  }
  list<string> inputFiles;
  while ((pDirent = readdir(pDir)) != NULL) {
    string filename = pDirent->d_name;
    int length = filename.length();
    if(filename.length() > 3 && filename.substr(filename.length() - 3, 3) == ".in") {
      inputFiles.push_back("../../icpc2018data/F-gowithflow/" + filename);
    }
  }
  closedir (pDir);

  for (list<string>::iterator iterator = inputFiles.begin(); iterator != inputFiles.end(); iterator++) {
    cout << *iterator << endl;
    solve(*iterator);
  }
}