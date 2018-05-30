import LastRequest from '../models/LastRequest.model';
import { Subject, ReplaySubject, Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Response } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class LastRequestService{
    private reqSubject: ReplaySubject<String> = new ReplaySubject();
    public error$: Observable<String> = this.reqSubject.asObservable();
    api_url = 'http://200.80.28.114:3000';
    lastReqUrl = `${this.api_url}/proxy/lastRequest`;

    constructor (private http: HttpClient) {}

    getLastRequests(): Observable<LastRequest[]>{
        return this.http.get(this.lastReqUrl)
        .map( res => {
            return res as LastRequest[];
        })
        .catch(
            error => this.handleError(error)
        )
    }

    handleError(data: Response | any ){
        if(data.status == 403){
            console.error('An error ocurred', data);
        }
        this.reqSubject.next('Something is broken');
        return Observable.throw(data || 'Broken');
    }

}
