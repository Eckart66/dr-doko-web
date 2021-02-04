import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { TabledataService } from '../tabledata.service';
import { PlayerData } from '../playerData';
import { ResultPerTeam, ResultData} from '../resultData';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  playerData: PlayerData[] = [
    {
      name: 'A', // new_name'',
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
    },
    {
      name: 'B', // new_name'',
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
    },
    {
      name: 'C', // new_name'',
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
    },
    {
      name: 'D', // new_name'',
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
    }




  ];
  resultData: ResultData = {
    resultsPerPlayer: [],
    resultSums: [0,0,0,0],
    playerlastTrickCharly: -1,
    resultsPerTeam: []
  };

  updateCount = -1;

  constructor(private tabledataService: TabledataService) { }

  ngOnInit(): void {
    this.tabledataService.getUpdateCount().subscribe( updateCountValue => {
      if (this.updateCount != updateCountValue) {
        this.updateData();
        this.updateCount = updateCountValue;
      }
    });
  }

  updateData(): void {
    this.tabledataService.getTable().pipe(take(1)).subscribe( table => {
      this.playerData = table.players;
      this.resultData = table.results;
    });

  }

}
