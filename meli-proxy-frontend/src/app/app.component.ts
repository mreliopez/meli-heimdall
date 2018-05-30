import { Response } from '@angular/http';
import { StatisticsService } from './services/statistics.service';
import { LastRequestService } from './services/lastRequest.service';
import Statistics from './models/Statistics.model';
import LastRequest from './models/LastRequest.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import MethodStatistics from './models/methods.model';
import { MethodsService } from './services/methods.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor (private requestService: LastRequestService, private statisticsService : StatisticsService, private methodsService: MethodsService){}

  lastRequestList: LastRequest[];
  statisticsList: Statistics[];
  methodsList: MethodStatistics[];
  updatingReq: Boolean;
  updatingStats: Boolean;
  updatingMethods: Boolean;
  errorHandledReq: Boolean;
  errorHandledStat : Boolean;
  errorHandledMethod: Boolean;
  interval: number;
  intervalStats: number;
  intervalMethods: number;

  ngOnInit(): void{
    this.errorHandledReq = false;
    this.errorHandledStat = false;
    this.errorHandledMethod = false;
    this.updatingReq = false;
    this.updatingStats = false;
    this.updatingMethods = false;
    this.requestService.error$.subscribe(error => {
      console.log(error);
      this.errorHandledReq = true;
    });
    this.statisticsService.error$.subscribe(error => {
      console.log(error);
      this.errorHandledStat = true;
    });
    this.methodsService.error$.subscribe(error =>{
      console.log(error);
      this.errorHandledMethod = true;
    });
    this.getLastRequests();
    this.getStatistics();
    this.getMethods();
    
    this.interval = window.setInterval(() =>{
      console.log("running");
      this.getLastRequests();
    }, 10000);
    this.intervalStats = window.setInterval(() =>{
      console.log("Running statistics");
      this.getStatistics();
    }, 15000);
    this.intervalMethods = window.setInterval(() =>{
      console.log("Running statistics");
      this.getMethods();
    }, 7000);
  }

  getMethods(){
    this.updatingMethods = true;
    this.methodsService.getMethodsStatistics()
    .subscribe(methods => {
      this.updatingMethods = false;
      this.errorHandledMethod = false;
      this.methodsList = methods;
    });
  }

  getLastRequests(){
    this.updatingReq = true;
    this.requestService.getLastRequests()
    .subscribe(requests => {
      this.updatingReq = false;
      this.errorHandledReq = false;
      this.lastRequestList = requests;
    });
  }

  getStatistics(){
    this.updatingStats = true;
    this.statisticsService.getStatistics()
    .subscribe(statistics => {
      this.updatingStats = false;
      this.errorHandledStat = false;
      this.statisticsList = statistics;
    })
  }

  ngOnDestroy(): void{
    if(this.interval){
      window.clearInterval(this.interval);
    }
    if(this.intervalStats){
      window.clearInterval(this.intervalStats);
    }
    if(this.intervalMethods){
      window.clearInterval(this.intervalMethods);
    }
  }
}
