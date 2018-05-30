import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LastRequestService } from './services/lastRequest.service';
import { StatisticsService } from './services/statistics.service';
import { MethodsService } from './services/methods.service';


import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    LastRequestService,
    StatisticsService,
    MethodsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
