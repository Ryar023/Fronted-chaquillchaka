import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, Booking, BookingRequest } from '../models/booking.interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly bookingsUrl = `${environment.apiUrl}/bookings`;

  constructor(private readonly http: HttpClient) {}

  createBooking(request: BookingRequest): Observable<Booking> {
    return this.http.post<ApiResponse<Booking>>(this.bookingsUrl, request)
      .pipe(map((response) => response.data));
  }
}
