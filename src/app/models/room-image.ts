import { Room } from './room.interface';

const ROOM_IMAGE_FILENAMES: Record<Room['type'], string> = {
  Simple: 'habitacion-simple.jpg',
  Doble: 'habitacion-doble.jpg',
  Matrimonial: 'habitacion-matrimonial.jpg',
  Familiar: 'Habitacion familiar(2).jpg'
};

export function getRoomImageUrl(type: Room['type']): string {
  return `/assets/images/${encodeURIComponent(ROOM_IMAGE_FILENAMES[type])}`;
}
