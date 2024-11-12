import { Injectable } from '@angular/core';
import socketio, { Socket } from "socket.io-client";
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {
  private socketio: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  constructor() {
    this.socketio = socketio(environment.apiUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000
    });

    // Listen for connection success
    this.socketio.on("connect", () => {
      this.connectedSubject.next(true);
      console.log('Connected to WebSocket server');
    });

    // Listen for reconnection attempts
    this.socketio.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt #${attempt}`);
    });

    // Listen for reconnection success
    this.socketio.on('reconnect', () => {
      this.connectedSubject.next(true);
      console.log('Reconnected to WebSocket server');
    });

    // Listen for connection errors
    this.socketio.on("connect_error", (err) => {
      console.error('Connection error', err);
    });
  }

  emit<T>(event: string, payload: T): void {
    try {
      this.socketio.emit(event, payload);
    } catch (error) {
      console.error(`Error emitting event ${event}:`, error);
    }
  }

  on<T>(event: string): Observable<T> {
    return new Observable<T>(observer => {
      try {
        this.socketio.on(event, (response: T) => {
          observer.next(response);
        });
      } catch (error) {
        console.error(`Error listening to event ${event}:`, error);
        observer.error(error);
      }
    });
  }
}