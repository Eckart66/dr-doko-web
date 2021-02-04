import { Card } from './card';
import { User } from './user';
import { Game, GamePhase, Table } from './table';
import { PlayerData } from './playerData';
import { Rules } from './rules';
import { ResultPerTeam, ResultData} from './resultData';

export class TabledataImpl implements Table {

  public players: PlayerData[] = []; // 4 players
  public currentLead: number = 0; // the player that starts the current trick
  public rules: Rules = {
      ShortHand: true, // (true: keine 7,8,9) 
      SecondDulleTakesFirst: true,
      PointForCharly: true,
      BockAfter_60_60: true,
      ExtraPointForSolo: false,
      MandatorySoloIn3Sets: false
    };
  public cardsPerPlayer: number = 10; // e.g. 10 cards
  public deck: number[] = [];        // all cards (shuffled): first 10 cards: player 1, next 10 cards player 2 ...
  public deckCurrent: number[] = []; // current deck of cards after "Trumpfabgabe"
  public lastTrick: number[] = [];    // cards in last trick
  public currentTrick: number[] = []; // cards in current trick
  public results: ResultData = { 
      resultsPerPlayer: [],     // all results for each game: game 0 player 1,2,3,4,  game 1 player 1,2,3,4  etc.
      resultSums: [],  // sum of results for player 1,2,3,4
      playerlastTrickCharly: 0, // the player that had 
      resultsPerTeam: [] // array with two entries: [MainPlayer, Opponents]
  };
  public gamePhase: GamePhase = GamePhase.Bidding_FirstOrder;
  public game: Game = Game.Normal;
  public mainplayers: number[] = [];
  public fuchsjagd: boolean = false;
  public updateCount: number = 0;

  constructor() { this.init(); }

  public getPlayers():  PlayerData[] {
    return this.players;
  }

  public getTable(): Table {
    return this;
  }

  public getResults(): ResultData {
    return this.results;
  }

  public getUpdateCount(): number {
    return this.updateCount;
  }

  public loginUser(user: User): boolean {
    if (user.password != "dokoforever") {
      return false;
    }
    let freeplaces = 0;
    for (let i = 0; i < 4; i++) {
      if (this.players[i].name == user.name && this.players[i].token == user.token) {
        return true; // already at table
      }
      if (this.players[i].name == '') {
        freeplaces += 1;
      }
    }

    if (freeplaces == 0) {
      return false;
    }

    // search first free place
    for (let i = 0; i < 4; i++) {
      if (this.players[i].name == "") {
        this.players[i].name = user.name;
        this.players[i].token = user.token;
        this.updateCount++;

        if (freeplaces == 1) {
          // all places are now filled: start a game
          this.results.resultsPerPlayer = [];
          this.results.resultSums = [0,0,0,0];
          this.results.resultsPerTeam = [];
          this.newGame(user.token);
        }
        return true;
      }
    }
    return false;

  }

  public logoffUser(user: User): boolean {
    if (user.password != "dokoforever") {
      return false;
    }
    for (let i = 0; i < 4; i++) {
      if (this.players[i].name == user.name) {

        // free this place
        this.players[i].name = '';
        this.players[i].token = '';
        return true; 
      }
    }
    return false;
  }

  public newGame(token: string): boolean {
    this.fillDeck();
    if (this.deck.length != 4 * this.cardsPerPlayer)
    {
      console.log('error in newGame');
      return false;
    }

    this.currentLead = (this.results.resultsPerPlayer.length + 1) % 4;

    for (let i = 0; i < 4; i++) {
      // assign to players
      this.players[i].sortedCards = this.deck.slice(i*this.cardsPerPlayer, (i + 1) *this.cardsPerPlayer);
      this.players[i].sortedCards.sort(this.createCompareCards(this.game));
      this.players[i].calls = { Kontra: false, Re: false, NoX: 0, LowTrump: false, Solo: 0, Hochzeit: 0, Fuchsjagd: false };
      this.players[i].tricks = [];
    }
    this.currentTrick = [];
    this.lastTrick = [];
    this.gamePhase = GamePhase.Bidding_FirstOrder;
    this.game = Game.Normal;
    this.mainplayers = [];
    this.fuchsjagd = false;
    this.results.playerlastTrickCharly = -1;

    this.updateCount++;
    return true;
  }

  public announceWeiter(token: string): boolean {
    if (this.gamePhase == GamePhase.Bidding_FirstOrder) {
      this.gamePhase = GamePhase.Bidding_SecondOrder;
      this.updateCount++;
    }
    else if (this.gamePhase == GamePhase.Bidding_SecondOrder) {
        this.gamePhase = GamePhase.Play;
        this.calculateGame();
        this.updateCount++;
    }
    return true;
  }

  public announceSolo(kindOfSolo: number, token: string): boolean {
    let playerIndex = this.getPlayerIndex(token);
    if (playerIndex >= 0) {
      this.players[playerIndex].calls.Solo = kindOfSolo;

      this.updateCount++;

      return true;
    }
    else {
      return false;
    }
  }

  public announceTrumpfAbgabe(token: string, announce: boolean): boolean {
    let playerIndex = this.getPlayerIndex(token);
    if (playerIndex >= 0) {
      this.players[playerIndex].calls.LowTrump = announce;

      this.updateCount++;

      return true;
    }
    else {
      return false;
    }
  }

  public announceFuchsjagd(token: string, announce: boolean): boolean {
    let playerIndex = this.getPlayerIndex(token);
    if (playerIndex >= 0) {
      this.players[playerIndex].calls.Fuchsjagd = announce;

      this.updateCount++;

      return true;
    }
    else {
      return false;
    }
  }

  public announceHochzeit(kindOfHochzeit: number, token: string): boolean {
    let playerIndex = this.getPlayerIndex(token);
    if (playerIndex >= 0) {
      this.players[playerIndex].calls.Hochzeit = kindOfHochzeit;

      this.updateCount++;

      return true;
    }
    else {
      return false;
    }
  }

  public announceRe(token: string, announce: boolean): boolean {
    let playerIndex = this.getPlayerIndex(token);
    if (playerIndex >= 0) {
      this.players[playerIndex].calls.Re = announce;

      this.updateCount++;

      return true;
    }
    else {
      return false;
    }
  }

  public announceKontra(token: string, announce: boolean): boolean {
    let playerIndex = this.getPlayerIndex(token);
    if (playerIndex >= 0) {
      this.players[playerIndex].calls.Kontra = announce;

      this.updateCount++;

      return true;
    }
    else {
      return false;
    }
  }

  public announceKein(kindOfKein: number, token: string): boolean {
    let playerIndex = this.getPlayerIndex(token);
    if (playerIndex >= 0) {
      this.players[playerIndex].calls.NoX = kindOfKein;

      this.updateCount++;

      return true;
    }
    else {
      return false;
    }
  }

  public playCard(player: number, token: string, cardindex: number): boolean {
    let isToPlay = (this.currentLead + this.currentTrick.length) % 4;
    if (player == isToPlay && this.players[player].token == token && this.players[player].sortedCards.length > cardindex && cardindex >= 0) {
      this.currentTrick.push(this.players[player].sortedCards[cardindex]);
      this.players[player].sortedCards.splice(cardindex, 1);
      if (this.currentTrick.length == 4) {
        this.finishCurrentTrick();
      }
      this.updateCount++;
      return true;
    }
    return false;
  }

  private getPlayerIndex(token: string): number {
    for (let i = 0; i < 4; i++) {
      if (this.players[i].token == token) {
        return i;
      }
    }
    return -1;
  }



  private table: Table[] = [];

  private init(): void {
    this.table = [ { 
      players: [] ,
      rules: {
        ShortHand: true,
        SecondDulleTakesFirst: true,
        PointForCharly: true,
        BockAfter_60_60: true,
        ExtraPointForSolo: false,
        MandatorySoloIn3Sets: false
      },
      currentLead: 1,
      cardsPerPlayer: 10,  // e.g. 10 cards
      deck: [],        // all cards (shuffled): first 10 cards: player 1, next 10 cards player 2 ...
      deckCurrent: [], // current deck of cards after "Trumpfabgabe"
      lastTrick: [],    // cards in last trick
      currentTrick: [], // cards in current trick
      results: {
        resultsPerPlayer: [],
        resultSums: [0,0,0,0],
        playerlastTrickCharly: -1,
        resultsPerTeam: []
      },
      gamePhase: 0,
      game: Game.Normal,
      mainplayers: [],
      fuchsjagd: false,
      updateCount: 0
    }];
    this.dummyCreatePlayer('helmut');
    this.dummyCreatePlayer('chris');
    this.dummyCreatePlayer('stefan');
    this.dummyCreatePlayer('ecki');
    // this.newGame();
  }

  private fillDeck(): void {
    let deck: number[] = [];
    for (let i = 1; i < 14; i++) {
      if (i == 1 /* Ass */ || i >= 10 /* 10, bube, Dame, King */  || ( i >= 7 && i <= 9 && !this.rules.ShortHand)) {
        for (let ii = 0; ii < 2; ii++) {
          // each card twice
          deck.push(i + Card.Diamonds);
          deck.push(i + Card.Heart);
          deck.push(i + Card.Spade);
          deck.push(i + Card.Clubs);
        }
      }
    }
    // now shuffle the deck
    let bDeckOkay = false;
    while (!bDeckOkay) {
      for (let currentIndex = deck.length; currentIndex > 0; currentIndex--) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
  
        // And swap it with the current element.
        let temp  = deck[currentIndex-1];
        deck[currentIndex-1] = deck[randomIndex];
        deck[randomIndex] = temp;
      }
      bDeckOkay = this.checkDeck(deck);
    }

    this.deck = deck;
    this.deckCurrent = deck;
  }

  private checkDeck(deck: number[]): boolean {
    for (let i = 0; i < 4; i++) {
      // check cards for each player: not >= 5 kings, not <= 3 trumps
      let kings = 0; 
      let trumps = 0;
      let cPP = this.cardsPerPlayer;
      for (let iCard = 0; iCard < cPP; iCard++) {
        let card = deck[ i * cPP + iCard];
        if ((card & 15) == 13 /* King */) {
          kings++;
        }
        if (Card.isTrump(Game.Normal, card)) {
          trumps++;
        }
      }
      if (kings >= 5 || trumps <= 3) {
        return false;
      }
    }

    return true;
  }


  private dummyCreatePlayer(new_name: string): void {
    // player 0 starts with giving cards, player 1 is the first to play off
    this.players.push({
      name: '', // new_name'',
      token: '', // new_name, // from login with password
      sortedCards: [], // Karten sortiert noch auf der Hand
      tricks: [], // je 4 Karten pro  Stich
      calls: {
        Kontra: false,
        Re: false,
        NoX: 0, //  (1 = keine 90, 2 = keine 60, 3 = keine 30, 4 = Schwarz)
        LowTrump: false,
        Solo: 0, // (1 = buben, 2 = Damen, 3 = Trumpf solo)   
        Hochzeit: 0,
        Fuchsjagd: false 
      }
    })
  }

  private finishCurrentTrick(): void {
    let table = this;
    if (table.currentTrick.length == 4) {
      let ct = table.currentTrick;
      let wc = this.getWinningCard();
      let winningPlayer = (table.currentLead + wc) % 4;
      table.players[winningPlayer].tricks.push(ct[0], ct[1], ct[2], ct[3]);
      table.lastTrick = [ct[0], ct[1], ct[2], ct[3]]
      if ( (table.game == Game.Hochzeit_Any || table.game == Game.Hochzeit_Fehl ) 
            && table.mainplayers.length == 1
            && winningPlayer != table.mainplayers[0]) {

        // finde den Partner einer Hochzeit (erster Stich oder erster Fehlstich)
        if (table.game == Game.Hochzeit_Any || !Card.isTrump(table.game,table.currentTrick[0]) ) {
          table.mainplayers.push(winningPlayer);
        }
      }
      if (table.players[0].sortedCards.length == 0) {
        // last trick
        if (table.currentTrick[wc] == 11 + Card.Clubs 
            && table.players[0].sortedCards.length == 0) {
          table.results.playerlastTrickCharly = (table.currentLead + wc) % 4;
        }
        this.calculateResults();
      }
      table.currentTrick = [];
      table.currentLead = winningPlayer;
   }

  }

  private getWinningCard(): number {
    let trick = this.currentTrick;
    let eGame = this.game;
    let iWinningCard = 0;
    for (let i = 1; i < 4; i++) {
      if (Card.getSortValue(eGame, trick[i]) > Card.getSortValue(eGame, trick[iWinningCard])) {
        iWinningCard = i;
      }
      else if (this.rules.SecondDulleTakesFirst && trick[i] == trick[iWinningCard] && trick[i] == 10 + Card.Heart) {
        iWinningCard = i;
      }
    }
    return iWinningCard;
  }

  private createCompareCards(game: Game) {
    return function(a: number, b: number): number {
      if (a == b) {
        return 0;
      }
      if ( Card.getSortValue(game, a) < Card.getSortValue(game, b)) {
        return 1;
      }
      else {
        return -1;
      }
    }
  }

  private compareCards(a: number, b: number): number {
    if (a == b) {
      return 0;
    }
    if ( Card.getSortValue(this.game, a) < Card.getSortValue(this.game, b)) {
      return 1;
    }
    else {
      return -1;
    }
  }

  private calculateGame(): void {
    let bestValue = 0;
    let iPlayer = -1;
    let players = this.players;
    this.mainplayers = [];

    // find announcement with highest value
    for (let i = 0; i < 4; i++ ) {
      let calls = players[(i + this.currentLead) % 4].calls;
      if (calls.Solo > 0) {
        calls.Kontra = false;
        calls.Hochzeit = 0;
      }
      let val1 = (calls.Solo * 2 + (calls.Solo > 0 && calls.Re ? 6 : 0) + (calls.Solo > 0 && calls.NoX > 0 ? 6 : 0) + (calls.Hochzeit > 0 ? 1 : 0) );
      if (val1 > bestValue) {
        bestValue = val1;
        iPlayer = ((i + this.currentLead) % 4);
      }
    }

    this.game = Game.Normal;
    if (iPlayer >= 0) {
      if (players[iPlayer].calls.Solo == 1) {
        this.game = Game.BubenSolo;
      }
      else if (players[iPlayer].calls.Solo == 2) {
        this.game = Game.DamenSolo;
      }
      else if (players[iPlayer].calls.Solo == 3) {
        this.game = Game.TrumpfSolo;
      }
      else if (players[iPlayer].calls.Hochzeit == 1) {
        this.game = Game.Hochzeit_Fehl;
      }
      else if (players[iPlayer].calls.Hochzeit == 2) {
        this.game = Game.Hochzeit_Any;
      }

      this.mainplayers = [iPlayer];

      // remove all anouncements from other players
      for (let i = 0; i < 4; i++ ) {
        if (i != iPlayer) {
          players[i].calls.Solo = 0;
          players[i].calls.Re = false;
          players[i].calls.Kontra = false;
          players[i].calls.NoX = 0;
          players[i].calls.Solo = 0;
          if (players[iPlayer].calls.Solo > 0) 
          {
            players[i].calls.Fuchsjagd = false;
          }
        }
        if (this.game == Game.BubenSolo || this.game == Game.DamenSolo) {
          // resort the cards
          this.players[i].sortedCards.sort(this.createCompareCards(this.game));
        }
      }
    } // endif iPlayer >= 0

    if (this.game == Game.Normal) {
      // find the partner main-players by the Kreuz Dame
      for (let i = 0; i < 4; i++ ) {
        for (let iCard = 0; iCard < 4; iCard++) {
          // by sorting, the Kreuz Dame must be one of the first three cards
          if (players[i].sortedCards[iCard] == 12 /* Dame */ + Card.Clubs) {
            this.mainplayers.push(i);
            break;
          }
        }
      }
    }

  } // end private calculateGame()

  private calculateResults(): void {
    let players = this.players;
    this.results.resultsPerTeam = [];
    this.calculateTeamResults(this.mainplayers, 0)
    let opponentPlayers = [];
    for (let i = 0; i < 4; i++) {
      if (this.mainplayers.indexOf(i) < 0) {
        opponentPlayers.push(i);
      }
    }
    this.calculateTeamResults(opponentPlayers, 1)

    let extraPoints = this.results.resultsPerTeam[0].extraPoints - this.results.resultsPerTeam[1].extraPoints;
    let gameResult : number[] = [];
    for (let i = 0; i < 4; i++) {
      let extraPointsForPlayer = extraPoints;
      if (this.mainplayers.indexOf(i) < 0) {
        extraPointsForPlayer = -extraPoints;
      } else {
        if (this.mainplayers.length == 1) {
          extraPointsForPlayer = extraPointsForPlayer * 3;
        }
      }
      gameResult.push(extraPointsForPlayer);
      this.results.resultSums[i] += extraPointsForPlayer;
    }
    this.results.resultsPerPlayer.push(gameResult);
  }

  private calculateTeamResults(teamplayers: number[], teamIndex: number): void {
    let dullen = 0;
    let foxes = 0;
    let ownfoxes = 0;
    let cardValues = 0;

    let keineX = 0;

    // count dullen, foxes and values of cards
    // ---------------------------------------
    teamplayers.forEach ( playerIdx => {
      keineX = Math.max(this.players[playerIdx].calls.NoX, keineX);
      this.players[playerIdx].tricks.forEach (card => {
        if (card == 10 + Card.Heart) {
          dullen++;
        }
        else if (card == 11 + Card.Clubs) {
          foxes++;
        }
        cardValues += Card.getValue( card & 15);
      } );

      for (let i = 0; i < this.cardsPerPlayer; i++) {
        let card = this.deckCurrent[playerIdx * this.cardsPerPlayer + i];
        if (card == 10 + Card.Heart) {
          dullen--;
        }
        else if (card == 11 + Card.Clubs) {
          ownfoxes++;
        }
      }
    });

    this.results.resultsPerTeam.push({playersnames: '', cardValues: 0,  extraPoints: 0, extraPointsText: ''}); 

    let resultsPerTeam = this.results.resultsPerTeam[teamIndex];
    
    // points for values of cards
    // ---------------------------------------
    resultsPerTeam.cardValues = cardValues;
    if (cardValues == 240) {
      resultsPerTeam.extraPoints = 5;
      resultsPerTeam.extraPointsText = 'Schwarz, ';
    }
    else if (cardValues > 210) {
      resultsPerTeam.extraPoints = 4;
      resultsPerTeam.extraPointsText = 'Keine 3, ';
    }
    else if (cardValues > 180) {
      resultsPerTeam.extraPoints = 3;
      resultsPerTeam.extraPointsText = 'Keine 6, ';
    }
    else if (cardValues > 150) {
      resultsPerTeam.extraPoints = 2;
      resultsPerTeam.extraPointsText = 'Keine 9, ';
    }
    else if (cardValues > 120 || (cardValues == 120 && teamIndex == 1)) {
      resultsPerTeam.extraPoints = 1;
      resultsPerTeam.extraPointsText = 'Keine 12, ';
    }
    if (cardValues >= 120 && teamIndex == 1) {
      resultsPerTeam.extraPoints++;
      resultsPerTeam.extraPointsText += 'Gegen, ';
    }

    if (this.game != Game.BubenSolo && this.game != Game.DamenSolo && this.game != Game.TrumpfSolo ) {
      // special points, that do no count in solo games
      // point for "gefangene Dulle"
      // ---------------------------------------
      if (dullen > 0) {
        // mehr Dullen im Stich als vorher auf der Hand
        resultsPerTeam.extraPoints++;
        resultsPerTeam.extraPointsText += 'Dulle gef, ';
      }
      
      // points for foxes or Fuchsjagd
      // ---------------------------------------
      //  Fuechse zaehlen nur, wenn nicht Solo
      if (!this.fuchsjagd ) 
      {
        foxes = foxes - ownfoxes;
        if (foxes > 0) {
        // mehr Fuechse in Stichen als vorher auf der Hand
          resultsPerTeam.extraPoints += foxes;
          resultsPerTeam.extraPointsText += foxes.toString() + ' Fuchs gef, ';
        }
      }
      else {
        // Fuchsjagd: gewonnen, wenn 2 Fuechse in den Stichen
        if (foxes == 2) {
            resultsPerTeam.extraPoints += 3;
            resultsPerTeam.extraPointsText += ' Fuchsjagd gew, ';
          }
      }

      // points for Charly
      // ---------------------------------------
      if (this.results.playerlastTrickCharly >= 0 && teamplayers.length == 2 && 
        (this.results.playerlastTrickCharly == teamplayers[0] || this.results.playerlastTrickCharly == teamplayers[1]) ) {
        resultsPerTeam.extraPoints += 1;
        resultsPerTeam.extraPointsText += ' Charly, ';
      }

    }


    // Names
    resultsPerTeam.playersnames = this.players[ teamplayers[0] ].name;
    if (teamplayers.length >= 2 ) {
      resultsPerTeam.playersnames += " + " + this.players[ teamplayers[1] ].name;
    }
    if (teamplayers.length >= 3 ) {
      resultsPerTeam.playersnames += " + " + this.players[ teamplayers[2] ].name;
    }

    // overall points
    // --------------
    let bRe = false;
    let bKontra = false;
    this.players.forEach (player => {
      if (player.calls.Re) {
        bRe = true;
      }
      if (player.calls.Kontra) {
        bKontra = true;
      }
    });

    let factor = 1;
    if (bRe) {
      resultsPerTeam.extraPointsText += "Re ";
      factor = 2;
    }
    if (bKontra) {
      resultsPerTeam.extraPointsText += "Kontra ";
      factor = factor * 2;
    }

    resultsPerTeam.extraPoints = factor * resultsPerTeam.extraPoints;
    resultsPerTeam.extraPointsText += resultsPerTeam.extraPoints.toString() + " Points."
  }

}
