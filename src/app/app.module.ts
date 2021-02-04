import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TableviewComponent } from './tableview/tableview.component';
import { OwncardsComponent } from './owncards/owncards.component';
import { ResultsComponent } from './results/results.component';
import { OwnactionsComponent } from './ownactions/ownactions.component';
import { LoginuserComponent } from './loginuser/loginuser.component';

@NgModule({
  declarations: [
    AppComponent,
    TableviewComponent,
    OwncardsComponent,
    ResultsComponent,
    OwnactionsComponent,
    LoginuserComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
