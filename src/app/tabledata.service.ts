import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Card } from './card';
import { User } from './user';
import { Game, GamePhase, Table } from './table';
import { PlayerData } from './playerData';
import { ResultPerTeam, ResultData} from './resultData';
import { TabledataImpl } from './tabledata.impl';

@Injectable({
  providedIn: 'root'
})

export class TabledataService {

  // URLs for web api
  private tableUrl = 'api/table';  
  private resultUrl = 'api/table/result';  
  private updateCountUrl = 'api/table/updateCount';

  private table: TabledataImpl[];
  private remoteTable: Table[] = [];
  private simulateServer = false;

  private myWebSocket: any = null;

  updateCount = new Subject<number>();
  remoteUpdateCount = 0;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };  


  constructor(private http: HttpClient) { this.table = [new TabledataImpl()];
//    setInterval(() => { this.doReceiveWsMessage("hello");
//    }, 5000);    

    this.http.get<number>('api/table/nextUpdateCount/' + this.remoteUpdateCount.toString()).subscribe( this.callbackGet.bind(this) );


    // this.myWebSocket = new WebSocket('ws://localhost:8081');
    // z.B. myWebSocket = new WebSocket('ws://localhost:8081');	
    // also possible a second connection for other result:  myWebSocket2 = new WebSocket('ws://localhost:8081/Testcase2_Random');

    // this.myWebSocket.onmessage = this.doReceiveWsMessage.bind(this);
  }

  public callbackGet(apiUpdateCount: any): void {
    if (this.remoteUpdateCount != apiUpdateCount) {
      this.remoteUpdateCount = apiUpdateCount;
      this.http.get<Table>(this.tableUrl).subscribe( table => {
        this.remoteTable = [table];
        this.updateCount.next(this.remoteUpdateCount);
      });
    }

    setTimeout( () => {
      this.http.get<number>('api/table/nextUpdateCount/' + this.remoteUpdateCount.toString()).subscribe( this.callbackGet.bind(this) );
    }, 100);

  }

  public doReceiveWsMessage(message: any) {
    console.log("Receive Websocket Message");
    console.log(message);
    if (this.simulateServer) {
      this.remoteUpdateCount++;
      this.updateCount.next(this.remoteUpdateCount);
    } 
    else {
//        this.http.get<number>(this.updateCountUrl).subscribe( apiUpdateCount => {

      this.http.get<number>('api/table/nextUpdateCount/' + this.remoteUpdateCount.toString()).subscribe( this.callbackGet.bind(this) );

          // this.http.get<number>('api/table/nextUpdateCount/' + this.remoteUpdateCount.toString()).subscribe( apiUpdateCount => {
          // if (this.remoteUpdateCount != apiUpdateCount) {
          //   this.remoteUpdateCount = apiUpdateCount;
          //   this.http.get<Table>(this.tableUrl).subscribe( table => {
          //     this.remoteTable = [table];
          //     this.updateCount.next(this.remoteUpdateCount);
          //   });
          // }

//        });
    }      

  }

  public getTable(): Observable<Table> {
    if (this.simulateServer) {
      return of(this.table[0]);
    } 
    else {
      if (this.remoteTable.length > 0) {
        return of(this.remoteTable[0]);
      }
      else {
        return of(this.table[0]);
      }
    }
  }

  public getResults(): Observable<ResultData> {
    if (this.simulateServer) {
      return of(this.table[0].results);
    } 
    else {
      return this.http.get<ResultData>(this.resultUrl)
      .pipe(
        tap(_ => console.log('tap fetched result')),
        catchError(this.handleError<ResultData>('getResult'))
      );
    }

  }

  public getUpdateCount(): Observable<number> {
    return this.updateCount;
  }

  public loginUser(user: User): Observable<any> {
    if (this.simulateServer)  {
      return of(this.table[0].loginUser(user));
    } 
    else {
      return this.http.put(this.tableUrl + "/user/" + user.name, user, this.httpOptions).pipe(
        tap(_ => console.log(`login user {{user.name}}`)),
        catchError(this.handleError<any>('loginUser'))
      );
    }
  }

  public logoffUser(user: User): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].logoffUser(user));
    } 
    else {
      return this.http.delete(this.tableUrl + "/user/" + user.name, this.httpOptions).pipe(
        tap(_ => console.log(`logoff user {{user.name}}`)),
        catchError(this.handleError<any>('loginUser'))
      );
    }
  }

  public newGame(token: string): Observable<any> {
    if (this.simulateServer) {
      this.table[0].newGame(token);
      return of(true);
    } 
    else {
      return this.http.put(this.tableUrl + "/newGame/" + token, this.httpOptions).pipe(
        tap(_ => console.log(`newGame`)),
        catchError(this.handleError<any>('newGame'))
      );
    }
  }

  public announceWeiter(token: string): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].announceWeiter(token));
    } 
    else {
      return this.http.put(this.tableUrl + "/announce/weiter/" + token, this.httpOptions).pipe(
        tap(_ => console.log(`announce Weiter`)),
        catchError(this.handleError<any>('announceWeiter'))
      );
    }
  }

  public announceSolo(kindOfSolo: number, token: string): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].announceSolo(kindOfSolo, token));
    } 
    else {
      console.log("announce a solo");
      return this.http.put(this.tableUrl + "/announce/Solo/" + token, {kindOfSolo: kindOfSolo}, this.httpOptions).pipe(
        tap(_ => console.log(`announceSolo: {{kindOfSolo}}`)),
        catchError(this.handleError<any>('announceSolo'))
      );
    }
  }

  public announceTrumpfAbgabe(token: string, announce: boolean): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].announceTrumpfAbgabe(token, announce));
    } 
    else {
      return this.http.put(this.tableUrl + "/announce/TrumpfAbgabe/" + token, {announce : announce}, this.httpOptions).pipe(
        tap(_ => console.log(`announceTrumpfAbgabe: {{announce}}`)),
        catchError(this.handleError<any>('announceTrumpfAbgabe'))
      );
    }
  }

  public announceFuchsjagd(token: string, announce: boolean): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].announceFuchsjagd(token, announce));
    } 
    else {
      return this.http.put(this.tableUrl + "/announce/Fuchsjagd/" + token, {announce : announce}, this.httpOptions).pipe(
        tap(_ => console.log(`announceFuchsjagd: {{announce}}`)),
        catchError(this.handleError<any>('announceFuchsjagd'))
      );
    }
  }

  public announceHochzeit(kindOfHochzeit: number, token: string): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].announceHochzeit(kindOfHochzeit, token));
    } 
    else {
      return this.http.put(this.tableUrl + "/announce/Hochzeit/" + token, {kindOfHochzeit: kindOfHochzeit}, this.httpOptions).pipe(
        tap(_ => console.log(`announceHochzeit: {{kindOfHochzeit}}`)),
        catchError(this.handleError<any>('announceHochzeit'))
      );
    }
  }

  public announceRe(token: string, announce: boolean): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].announceRe(token, announce));
    } 
    else {
      return this.http.put(this.tableUrl + "/announce/Re/" + token, {announce : announce}, this.httpOptions).pipe(
        tap(_ => console.log(`announceRe: {{announce}}`)),
        catchError(this.handleError<any>('announceRe'))
      );
    }
  }

  public announceKontra(token: string, announce: boolean): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].announceKontra(token, announce));
    } 
    else {
      return this.http.put(this.tableUrl + "/announce/Kontra/" + token, {announce : announce}, this.httpOptions).pipe(
        tap(_ => console.log(`announceKontra: {{announce}}`)),
        catchError(this.handleError<any>('announceKontra'))
      );
    }
  }

  public announceKein(kindOfKein: number, token: string): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].announceKein(kindOfKein, token));
    } 
    else {
      return this.http.put(this.tableUrl + "/announce/Kein/" + token, {kindOfKein: kindOfKein}, this.httpOptions).pipe(
        tap(_ => console.log(`announceKein: {{kindOfKein}}`)),
        catchError(this.handleError<any>('announceKein'))
      );
    }
  }

  public playCard(player: number, token: string, cardindex: number): Observable<any> {
    if (this.simulateServer) {
      return of(this.table[0].playCard(player, token, cardindex));
    } 
    else {
      return this.http.put(this.tableUrl + "/playCard/" + token, {player: player, cardindex: cardindex}, this.httpOptions).pipe(
        tap(_ => console.log(`playCard: {{cardindex}}`)),
        catchError(this.handleError<any>('playCard'))
      );
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }  

}