import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginResponse } from '../model/authResponseModel';
import { User } from '../model/IUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiUrl

  constructor(private http:HttpClient) { }

  userRegister(userData: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/user/register`, userData);
  }

// Inside your AuthService
userLogin(email: string, password: string): Observable<LoginResponse> {
  console.log("Login data:", { email, password });
  return this.http.post<LoginResponse>(`${this.baseUrl}/user/login`, { email, password },{ withCredentials: true });
}

isAuth(): Observable<boolean> {
  return this.http.get<boolean>(`${this.baseUrl}/user/isAuth`, { withCredentials: true });
}

}
