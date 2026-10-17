export interface Room {
  _id: string;
  name: string;
  type: 'Simple' | 'Doble' | 'Matrimonial' | 'Familiar';
  description: string;
  pricePen: number;
  priceUsd: number;
  capacity: number;
  services: string[];
  photos: string[];
  status: 'available' | 'maintenance';
}

export interface RoomOccupancy {
  roomId: string;
  checkIn: string;
  checkOut: string;
}
