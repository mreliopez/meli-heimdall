import MethodsStatistics from '../models/methods.model';
import { Subject, ReplaySubject, Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Response } from '@angular/http';
import { Injectable } from '@angular/core';
import MethodStatistics from '../models/methods.model';

@Injectable()
export class MethodsService{
    private methodSubject : ReplaySubject<String> = new ReplaySubject();
    public error$ : Observable<String> = this.methodSubject.asObservable();

    api_url = "http://200.80.28.114:3000";
    methodUrl = `${this.api_url}/proxy/methods`;

    constructor(private http: HttpClient){}

    getMethodsStatistics(): Observable<MethodStatistics[]>{
        return this.http.get(this.methodUrl)
        .map(res => {
            return res as MethodStatistics[];
        })
        .catch(error => this.handleError(error))
    }

    handleError(data: Response | any){
        if(data.status == 403){
            console.error('An error ocurred', data);
        }
        this.methodSubject.next('Something is broken');
        return Observable.throw(data || 'Broken');
    }
}