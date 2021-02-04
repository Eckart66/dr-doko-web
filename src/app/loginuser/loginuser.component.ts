import { Component, OnInit } from '@angular/core';
import { User } from '../user'
import { CurrentUserService } from '../current-user.service';
import { TabledataService } from '../tabledata.service';

@Component({
  selector: 'app-loginuser',
  templateUrl: './loginuser.component.html',
  styleUrls: ['./loginuser.component.css']
})
export class LoginuserComponent implements OnInit {

  public user: User = {name: "", password: "", token: ""};

  constructor(private currentUserService: CurrentUserService, 
              private tabledataService: TabledataService) { }

  ngOnInit(): void {
  }

  doLogin(): boolean {
    this.user.token = this.user.name;
    this.tabledataService.loginUser(this.user).subscribe( result => {
      if (result == "ok") {
        this.currentUserService.setCurrentUser(this.user.name, this.user.name);
      }
    });

    return true;

  }

  doLogoff(): boolean {
    if (this.user.name != '') {
      this.tabledataService.logoffUser(this.user);
      this.currentUserService.setCurrentUser('', '');
      return true;
    }
    return false;

  }

}
