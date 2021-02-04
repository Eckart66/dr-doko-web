import {Calls} from './calls'

export interface PlayerData {
    name: string;
    token: string; // from login with password
    sortedCards: number[]; // Karten sortiert noch auf der Hand
    tricks: number[]; // je 4 Karten pro  Stich
    calls: Calls;
  }