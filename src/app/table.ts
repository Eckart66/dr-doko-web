import {Calls} from './calls'
import {Rules} from './rules'
import {PlayerData} from './playerData'
import { ResultData } from './resultData'

export enum GamePhase {
  Bidding_FirstOrder = 1,
  Bidding_SecondOrder = 2,
  Play = 3,
  Finished = 4
}  

export enum Game {
  Normal = 0,
  BubenSolo = 1,
  DamenSolo = 2,
  TrumpfSolo = 3,
  Hochzeit_Fehl = 4,
  Hochzeit_Any = 5
}  

export interface Table {
    players: PlayerData[]; // 4 players
    currentLead: number; // the player that starts the current trick
    rules: Rules;
    cardsPerPlayer: number; // e.g. 10 cards
    deck: number[];        // all cards (shuffled): first 10 cards: player 1, next 10 cards player 2 ...
    deckCurrent: number[]; // current deck of cards after "Trumpfabgabe"
    lastTrick: number[];    // cards in last trick
    currentTrick: number[]; // cards in current trick
    results: ResultData;
    gamePhase: GamePhase;
    game: Game;
    mainplayers: number[];
    fuchsjagd: boolean;
    updateCount: number;
    adminMode: boolean,
  }