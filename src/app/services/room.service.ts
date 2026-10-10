import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { ApiResponse } from '../models/booking.interface';
import { Room } from '../models/room.interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly roomsUrl = `${environment.apiUrl}/rooms`;
  private readonly cacheKey = 'chaquill-chaka.rooms.v1';
  private readonly cacheMaxAgeMs = 24 * 60 * 60 * 1000;
  private roomsRequest?: Observable<Room[]>;

  constructor(private readonly http: HttpClient) {}

  getRooms(): Observable<Room[]> {
    if (!this.roomsRequest) {
      this.roomsRequest = this.http.get<ApiResponse<Room[]>>(this.roomsUrl).pipe(
        map((response) => {
          this.saveCachedRooms(response.data);
          return response.data;
        }),
        catchError((error: unknown) => {
          this.roomsRequest = undefined;
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.roomsRequest;
  }

  getCachedRooms(): Room[] {
    try {
      const cachedValue = localStorage.getItem(this.cacheKey);
      if (!cachedValue) return [];

      const parsed: unknown = JSON.parse(cachedValue);
      if (!this.isRoomCache(parsed) || Date.now() - parsed.savedAt > this.cacheMaxAgeMs) {
        localStorage.removeItem(this.cacheKey);
        return [];
      }
      return parsed.rooms;
    } catch (error) {
      console.warn('No se pudo leer el catálogo guardado en este navegador.', error);
      return [];
    }
  }

  refreshRooms(): Observable<Room[]> {
    this.roomsRequest = undefined;
    return this.getRooms();
  }

  getRoomById(id: string): Observable<Room> {
    return this.http.get<ApiResponse<Room>>(`${this.roomsUrl}/${encodeURIComponent(id)}`)
      .pipe(map((response) => response.data));
  }

  private saveCachedRooms(rooms: Room[]): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify({ savedAt: Date.now(), rooms }));
    } catch (error) {
      console.warn('No se pudo guardar el catálogo de habitaciones en este navegador.', error);
    }
  }

  private isRoomCache(value: unknown): value is { savedAt: number; rooms: Room[] } {
    if (typeof value !== 'object' || value === null || !('savedAt' in value) || !('rooms' in value)) {
      return false;
    }
    const cache = value as { savedAt: unknown; rooms: unknown };
    return typeof cache.savedAt === 'number' &&
      Date.now() - cache.savedAt >= 0 &&
      Array.isArray(cache.rooms) &&
      cache.rooms.every((room) =>
        typeof room === 'object' &&
        room !== null &&
        '_id' in room &&
        typeof room._id === 'string' &&
        'name' in room &&
        typeof room.name === 'string' &&
        'type' in room &&
        typeof room.type === 'string' &&
        'pricePen' in room &&
        typeof room.pricePen === 'number' &&
        'priceUsd' in room &&
        typeof room.priceUsd === 'number' &&
        'capacity' in room &&
        typeof room.capacity === 'number' &&
        'services' in room &&
        Array.isArray(room.services) &&
        'photos' in room &&
        Array.isArray(room.photos)
      );
  }
}
