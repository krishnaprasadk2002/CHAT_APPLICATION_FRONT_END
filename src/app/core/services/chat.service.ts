import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { SocketIoService } from './socket-io.service';
import { ICreateNewChatSuccessfullAPIResponse } from '../model/IChatResponse';
import { UserAPIEndUrl } from '../enums/apiEndUrls';
import { userResponse } from '../model/IUser';
import { IMessage } from '../model/IMessages';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private httpClient: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.apiUrl;

  constructor() { }
  private socketIoService = inject(SocketIoService)

  createNewChat(reciverId: string): Observable<ICreateNewChatSuccessfullAPIResponse> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.CREATE_NEW_CHAT}`

    return this.httpClient.post<ICreateNewChatSuccessfullAPIResponse>(api, { reciverId }).pipe(
      catchError(error => {
        console.error('Error creating chat:', error);
        return throwError(error);
      })
    );
  }

  createGroupChat(groupName: string, members: string[]): Observable<ICreateNewChatSuccessfullAPIResponse> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.CREATE_NEW_GROUP}`; 

    return this.httpClient.post<ICreateNewChatSuccessfullAPIResponse>(api, { groupName, members }).pipe(
      catchError(error => {
        console.error('Error creating group chat:', error);
        return throwError(error);
      })
    );
  }
  getUserGroupChats(): Observable<userResponse> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.LOAD_GROUP}`; 

    return this.httpClient.get<userResponse>(api).pipe(
      catchError(error => {
        console.error('Error getting groups:', error);
        return throwError(error);
      })
    );
  }


  // Listen for new messages via WebSocket
  onNewMessage(): Observable<IMessage> {
    return this.socketIoService.on<IMessage>('receiveMessage');
}
  // Listen chat history
  onChatHistoryFetched(): Observable<IMessage[]> {
    return this.socketIoService.on<IMessage[]>('messagesFetched');
  }

  // Fetch chat history 
  fetchChatHistory(chatId: string): void {
    this.socketIoService.emit('fetchMessages', chatId);
  }


  GetAllUsers(): Observable<userResponse> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.GET_ALL_USERS}`;
    return this.httpClient.get<userResponse>(api, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Error getting users', error);
        return throwError(error);
      })
    );
  }

  getUserId(): Observable<{ success: boolean; message: string; userId: string }> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.GET_USER_ID}`;
    return this.httpClient.get<{ success: boolean; message: string; userId: string }>(api).pipe(
      catchError(error => {
        console.error('Error getting userId', error);
        return throwError(error);
      })
    )
  }

  getReceiverDataProfile(userId: string): Observable<userResponse> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.GET_RECEIVER_PROFILE}`
    return this.httpClient.get<userResponse>(api, { params: { userId } }).pipe(
      catchError(error => {
        console.error('Error getting receiver data', error);
        return throwError(error);
      })
    );
  }

  getUserData(): Observable<userResponse> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.GET_USER_DATA}`
    return this.httpClient.get<userResponse>(api).pipe(
      catchError(error => {
        console.error('Error getting user data', error);
        return throwError(error);
      })
    );
  }

getUserById(userId: string): Observable<any> {
  console.log(`Sending request to fetch user profile with ID: ${userId}`);
  return this.httpClient.get<any>(`${this.baseUrl}/user/userprofile/${userId}`);
  
}

updateUserProfile(userId: string, updatedProfile: any): Observable<any> {
  const apiUrl = `${this.baseUrl}/user/update/${userId}`; 
  return this.httpClient.put(apiUrl, updatedProfile); 
}

  // Method to send the search term to the backend
  onSearch(searchTerm: string): Observable<any> {
    const params = new HttpParams().set('search', searchTerm); 
    return this.httpClient.get(`${this.baseUrl}/user/search`, { params }); 
  }


}
