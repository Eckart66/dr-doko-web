import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { Card } from '../card';
import { User } from '../user';
import { Game, GamePhase } from '../table';

import { TabledataService } from '../tabledata.service';
import { CurrentUserService } from '../current-user.service';

@Component({
  selector: 'app-owncards',
  templateUrl: './owncards.component.html',
  styleUrls: ['./owncards.component.css']
})
export class OwncardsComponent implements OnInit {

  constructor(private tabledataService: TabledataService, 
              private currentUserService: CurrentUserService) { }

  ownCards: number[] = [];
  ownCards1: number[] = [];
  ownCards2: number[] = [];
  ownCards3: number[] = [];
  isCardDisabled: boolean[] = [true, true, true, true, true, true, true, true, true, true, true, true];
  currentUser: User = {name: "", token: "", password: ""};
  iCurrentPlayerIndex: number = 0;
  game = Game.Normal;

  updateCount = -1;

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
    this.tabledataService.getTable().pipe(take(1)).subscribe ( table => {

      this.iCurrentPlayerIndex = 0;

      for (let i = 0; i < 4; i++) {
        if (table.players[i].name == this.currentUser.name) {
          this.iCurrentPlayerIndex = i;
          break;
        }
      }

      this.ownCards = table.players[this.iCurrentPlayerIndex].sortedCards;
      this.ownCards1 = table.players[(this.iCurrentPlayerIndex + 1) % 4].sortedCards;
      this.ownCards2 = table.players[(this.iCurrentPlayerIndex + 2) % 4].sortedCards;
      this.ownCards3 = table.players[(this.iCurrentPlayerIndex + 3) % 4].sortedCards;
      this.game = table.game;

      for (let i = 0; i < this.ownCards.length; i++) {
        if ( table.gamePhase != GamePhase.Play) {
          this.isCardDisabled[i] = true;  
        }
        else {
          if (table.currentTrick.length == 0) {
            this.isCardDisabled[i] = false;  
          }
          else {
            if (this.mussBedienen(table.currentTrick[0])) {
              this.isCardDisabled[i] = !this.cardFits(table.currentTrick[0], this.ownCards[i]);  
            }
            else {
              this.isCardDisabled[i] = false;  
            }
          }
        }
      }
    });
  }

  private static colorStrings = ["", String.fromCharCode(0x2662) /* Diamonds */, 
                                 String.fromCharCode(0x2665) /* Hearts */, 
                                 String.fromCharCode(0x2660), /* Spades */
                                 String.fromCharCode(0x2663) /* clubs */];

  private static valueStrings = ["0", "As", "2", "3", "4", "5", "6", "7", "8", "9", "10", "B", "D", "K"];
 
  public getCardAsString(card: number): string {
    return OwncardsComponent.colorStrings[((card & (7*16)) / 16)] + OwncardsComponent.valueStrings[card&15];
  }

  public getCardIsRed(card: number): boolean {
    return ((card & (7*16)) < 48);
  }

  public playCard(i: number): void {
    if (i < this.ownCards.length ) {
      this.tabledataService.playCard(this.iCurrentPlayerIndex, this.currentUser.token, i /* card number */).subscribe( result => {

      });

      // this.tabledataService.getTable().pipe(take(1)).subscribe ( table => {
      //   let name = table.players[(this.iCurrentPlayerIndex + 1)%4].name;
      //   this.currentUserService.setCurrentUser(name, name);
      // });
    }
  }

  private mussBedienen(firstCard: number): boolean {
    for (let i = 0; i < this.ownCards.length; i++) {
      if (this.cardFits(firstCard, this.ownCards[i])) {
        return true;
      }  
    }
    return false;
  }

  private cardFits(firstCard: number, checkCard: number): boolean {
    if (Card.isTrump(this.game, firstCard)) {
      return Card.isTrump(this.game, checkCard);
    }
    if (Card.isTrump(this.game, checkCard)) {
      return false;
    }
    // color must match
    return ((firstCard & 0x70) == (checkCard & 0x70));
  }

}
