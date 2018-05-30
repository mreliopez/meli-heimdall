import Statistics from '../models/Statistics.model';
import { Subject, ReplaySubject, Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Response } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class StatisticsService{
    private statSubject: ReplaySubject<String> = new ReplaySubject();
    public error$: Observable<String> = this.statSubject.asObservable();
    api_url = "http://200.80.28.114:3000";
    statUrl = `${this.api_url}/proxy/statistics`;

    constructor(private http: HttpClient){}

    getStatistics(): Observable<Statistics[]>{
        return this.http.get(this.statUrl)
        .map( res => {
            return res as Statistics[]
        })
        .catch(
            error => this.handleError(error)
        )
    }

    handleError(data: Response | any){
        if(data.status == 403){
            console.error('An error ocurred', data);
        }
        this.statSubject.next('Something is broken');
        return Observable.throw(data || 'Broken');
    }
}