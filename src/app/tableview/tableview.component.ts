import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { TabledataService } from '../tabledata.service';
import { CurrentUserService } from '../current-user.service';
import { Calls } from '../calls';
import { User } from '../user';

@Component({
  selector: 'app-tableview',
  templateUrl: './tableview.component.html',
  styleUrls: ['./tableview.component.css']
})
export class TableviewComponent implements OnInit {

  constructor(private tabledataService: TabledataService, 
              private currentUserService: CurrentUserService) {}

  playerNames: string[] = ["", "", "", ""];
  announcements: string[] = ["", "", "", ""];
  tricks: number[] = [0,0,0,0];
  leadPlayerIndex: number = 1;
  nextPlayerIndex: number = 1;
  currentTrick: number[] = [];
  lastTrick: number[] = [];
  currentUser: User = {name: "", token: "", password: ""};
  iCurrentUserIndex: number = 0;

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

  private static colorStrings = ["", String.fromCharCode(0x2662) /* Diamonds */, 
                                 String.fromCharCode(0x2665) /* Hearts */, 
                                 String.fromCharCode(0x2660), /* Spades */
                                 String.fromCharCode(0x2663) /* clubs */];

  private static valueStrings = ["0", "As", "2", "3", "4", "5", "6", "7", "8", "9", "10", "B", "D", "K"];
 
  public getCardAsString(card: number): String {
    return TableviewComponent.colorStrings[((card & (7*16)) / 16)] + TableviewComponent.valueStrings[card&15];
  }

  public getCardIsRed(card: number): boolean {
    return ((card & (7*16)) < 48);
  }


  private updateData(): void {
    this.tabledataService.getTable().pipe(take(1)).subscribe ( table => {
      let players = table.players;

      this.iCurrentUserIndex = 0;
  
      for (let i = 0; i < 4; i++) {
        if (players[i].name == this.currentUser.name) {
          this.iCurrentUserIndex = i;
          break;
        }
      }
  
      for (let i = 0; i < 4; i++) {
        this.playerNames[i] = players[(i + this.iCurrentUserIndex) % 4].name;
        this.announcements[i] = this.getAnnouncementAsString(players[(i + this.iCurrentUserIndex) % 4].calls)
        this.tricks[i] = Math.floor( players[(i + this.iCurrentUserIndex) % 4].tricks.length / 4 );
      }
      this.currentTrick = table.currentTrick;
      this.lastTrick = table.lastTrick;
      this.leadPlayerIndex = (table.currentLead + 4 - this.iCurrentUserIndex ) % 4;
      this.nextPlayerIndex = (table.currentLead + 4 - this.iCurrentUserIndex + this.currentTrick.length) % 4;
  
    });

  }

  private getAnnouncementAsString(call: Calls): string {
    let answer = "";

    if (call.Solo == 1) {
      answer = "B Solo "
    }
    else if (call.Solo == 2) {
      answer = "D Solo "
    }
    else if (call.Solo == 3) {
      answer = "Tr Solo "
    }

    if (call.Hochzeit > 0) {
      answer += "Hochz "
    }

    if (call.Fuchsjagd) {
      answer += "Fuchsj "
    }

    if (call.Re) {
      answer += "Re "
    }

    if (call.Kontra) {
      answer += "Kontra "
    }

    if (call.NoX == 4) {
      answer += "Schwarz "
    }
    else if (call.NoX == 3) {
      answer += "Keine 3 "
    }
    else if (call.NoX == 2) {
      answer += "Keine 6 "
    }
    else if (call.NoX == 1) {
      answer += "Keine 9 "
    }



    return answer;

  }

}
