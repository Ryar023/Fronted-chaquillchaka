export interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  paymentMethod: 'yape' | 'plin' | 'card' | 'cash';
  paymentCurrency: 'PEN' | 'USD';
}

export interface Booking {
  id: string;
  customer: { name: string; email: string; phone: string };
  room: { id: string; name: string; pricePen: number; priceUsd: number };
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNightPen: number;
  totalPen: number;
  pricePerNightUsd: number;
  totalUsd: number;
  paymentMethod: 'yape' | 'plin' | 'card' | 'cash';
  paymentCurrency: 'PEN' | 'USD';
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}
