import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';

import { User } from './user'

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  private user = new Subject<User>();

  constructor() { 
  }

  public setCurrentUser(name: string, token: string): void {
    this.user.next({name: name, password: "", token: token});
  }

  public getCurrentUser() : Observable<User> {
    return this.user;
  }
}
