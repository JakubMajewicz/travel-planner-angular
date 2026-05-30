import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Weather {
  
  private http = inject(HttpClient);
  private apiKey = '0cc80354e3074c0cbfe81101262803'; 

  getWeatherForCity(city: string): Observable<any> {
    const url = `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${city}&aqi=no`;
    return this.http.get(url);
  }
}