import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { User } from './user'

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  private user = new BehaviorSubject<User>({name: '', password: '', token: ''});
  private isLoggedIn = false;

  constructor() { 
  }

  public setCurrentUser(name: string, token: string): void {
    this.user.next({name: name, password: "", token: token});
  }

  public getCurrentUser() : Observable<User> {
    return this.user;
  }

  public setIsLoggedIn(isLoggedIn: boolean): void {
    this.isLoggedIn = isLoggedIn;
    this.user.next({name: this.user.getValue().name, password: this.user.getValue().password, token: this.user.getValue().token})
  }

  public getIsLoggedIn(): boolean {
    return this.isLoggedIn;
  }
}
