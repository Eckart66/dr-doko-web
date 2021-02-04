export interface ResultPerTeam {
  playersnames: string;    // names of players e.g. 'chris + ecki'
  cardValues: number;      // 
  extraPoints: number;     //
  extraPointsText: string; // extra points explanation as textArray with two entries 
}

export interface ResultData {
  resultsPerPlayer: number[] [];     // all results for each game: game 0 player 1,2,3,4,  game 1 player 1,2,3,4  etc.
  resultSums: number[];  // sum of results for player 1,2,3,4
  playerlastTrickCharly: number; // the player that had 
  resultsPerTeam: ResultPerTeam[]; // array with two entries: [MainPlayer, Opponents]
}