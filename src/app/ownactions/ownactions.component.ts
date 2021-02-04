import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { GamePhase } from '../table';
import { Card } from '../card';
import { User } from '../user';
import { Calls } from '../calls';
import { TabledataService } from '../tabledata.service';
import { CurrentUserService } from '../current-user.service';

@Component({
  selector: 'app-ownactions',
  templateUrl: './ownactions.component.html',
  styleUrls: ['./ownactions.component.css']
})
export class OwnactionsComponent implements OnInit {

  constructor(private tabledataService: TabledataService,
              private currentUserService: CurrentUserService) { }

  soloAnnounce = true;
  trumpfAbgabeAllowed = false;
  fuchsjagdAllowed = false;
  hochzeitAllowed = false;
  weiterAllowed = true;

  reAllowed = false;
  kontraAllowed = false;
  Keine9Allowed = false;
  Keine6Allowed = false;
  Keine3Allowed = false;
  Keine1Allowed = false;
  newGameAllowed = true;
  updateCount = -1;
  currentUser: User = {name: "", token: "", password: ""};
  iCurrentPlayerIndex: number = 0;

  currentCalls: Calls =  {
    Kontra: false,
    Re: false,
    NoX: 0, //  (1 = keine 90, 2 = keine 60, 3 = keine 30, 4 = Schwarz)
    LowTrump: false,
    Solo: 0, // (1 = buben, 2 = Damen, 3 = Trumpf solo)    
    Hochzeit: 0, // 1 = Fehlstich, 2 = Egalstich
    Fuchsjagd: false
  }

  ngOnInit(): void {
    this.tabledataService.getUpdateCount().subscribe( updateCountValue => {
      if (this.updateCount != updateCountValue) {
        this.updateData();
        this.updateCount = updateCountValue;
      }
    });

    this.currentUserService.getCurrentUser().subscribe(newCurrentUser => {
      this.currentUser = newCurrentUser;
      this.updateData();
    });    
  }

  private updateData(): void {
    this.tabledataService.getTable().pipe(take(1)).subscribe( table => {

      this.iCurrentPlayerIndex = 0;

      for (let i = 0; i < 4; i++) {
        if (table.players[i].name == this.currentUser.name) {
          this.iCurrentPlayerIndex = i;
          break;
        }
      }

      let playerData = table.players[this.iCurrentPlayerIndex];
      let gamePhase = table.gamePhase;
  
      let owncards = playerData.sortedCards;
      this.currentCalls = playerData.calls;
      let kings = 0;
      let trumps = 0; 
      let foxes = 0;
      let clubladies = 0;
      for (let i = 0; i < owncards.length; i++) {
        if ((owncards[i] & 15) == 13) {
          kings++;
        }
        if (owncards[i] == 1 + Card.Diamonds) {
          foxes++;
        }
        if (owncards[i] == 12 + Card.Clubs) {
          clubladies++;
        }
        if (  (owncards[i] == 10 + Card.Heart)
            ||((owncards[i] & 15) == 12)
            ||((owncards[i] & 15) == 11)
            ||( (owncards[i] & 0x70) == Card.Diamonds) ) {
          trumps++;
        }
      }
  
      this.reAllowed = true;
      this.kontraAllowed = true;
      this.Keine9Allowed = true;
      this.Keine6Allowed = true;
      this.Keine3Allowed = true;
      this.Keine1Allowed = true;
    
      if (gamePhase == GamePhase.Bidding_FirstOrder)  {
        this.soloAnnounce = true;
        this.newGameAllowed = true;
        this.weiterAllowed = true;
  
        this.trumpfAbgabeAllowed = (trumps < 4);
      }
      else if (gamePhase == GamePhase.Bidding_SecondOrder)  {
        this.soloAnnounce = false;
        this.trumpfAbgabeAllowed = false;
        this.fuchsjagdAllowed = (foxes == 2);
        this.hochzeitAllowed = (clubladies == 2);
        this.newGameAllowed = true;
        this.weiterAllowed = true;
      }
      else { 
        this.soloAnnounce = false;
        this.trumpfAbgabeAllowed = false;
        this.fuchsjagdAllowed = false;
        this.hochzeitAllowed = false;
        this.newGameAllowed = true;
        this.weiterAllowed = false;
  
        this.reAllowed = (playerData.sortedCards.length > 8);
        this.kontraAllowed = (playerData.sortedCards.length > 7);
        this.Keine9Allowed = (playerData.sortedCards.length > 6);
        this.Keine6Allowed = (playerData.sortedCards.length > 5);
        this.Keine3Allowed = (playerData.sortedCards.length > 4);
        this.Keine1Allowed = (playerData.sortedCards.length > 3);
      }
    });

  }

  public triggerNewGame(): void {
    this.tabledataService.newGame(this.currentUser.token).subscribe( result => {

    });
  }

  public announceWeiter(): void {
    this.tabledataService.announceWeiter(this.currentUser.token).subscribe( result => {
      
    });
  }

  public announceSolo(kindOfSolo: number): void {
    this.tabledataService.announceSolo(this.currentCalls.Solo == kindOfSolo ? 0 : kindOfSolo, this.currentUser.token).subscribe( result => {
      
    });
  }

  public announceTrumpfAbgabe(): void {
    this.tabledataService.announceTrumpfAbgabe(this.currentUser.token, !this.currentCalls.LowTrump).subscribe( result => {
      
    });
  }

  public announceFuchsjagd(): void {
    this.tabledataService.announceFuchsjagd(this.currentUser.token, !this.currentCalls.Fuchsjagd).subscribe( result => {
      
    });
  }

  public announceHochzeit(kindOfHochzeit: number): void {
    this.tabledataService.announceHochzeit( this.currentCalls.Hochzeit == kindOfHochzeit ? 0 : kindOfHochzeit, this.currentUser.token).subscribe( result => {
      
    });
  }

  public announceRe(): void {
    this.tabledataService.announceRe(this.currentUser.token, !this.currentCalls.Re).subscribe( result => {
      
    });
  }

  public announceKontra(): void {
    this.tabledataService.announceKontra(this.currentUser.token, !this.currentCalls.Kontra).subscribe( result => {
      
    });
  }

  public announceKein(kindOfKein: number): void {
    this.tabledataService.announceKein(this.currentCalls.NoX == kindOfKein ? 0: kindOfKein, this.currentUser.token).subscribe( result => {
      
    });
  }

}
