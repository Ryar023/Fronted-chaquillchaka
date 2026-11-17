import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Room } from '../../models/room.interface';
import { getRoomImageUrl } from '../../models/room-image';
import { RoomService } from '../../services/room.service';

type HotspotId = 'bed' | 'bath' | 'patio';

interface TourHotspot {
  id: HotspotId;
  label: string;
  top: string;
  left: string;
}

@Component({
  selector: 'app-tour-ar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="tour-hero">
      <div class="page-shell">
        <p class="eyebrow">Explora antes de reservar</p>
        <h1 class="section-title">Vista inmersiva de las habitaciones</h1>
        <p>Recorrido panorámico simulado con fotografías del alojamiento. Puedes arrastrar la imagen, usar las flechas del teclado o los controles accesibles.</p>
        <p class="tour-disclosure"><strong>Transparencia:</strong> este prototipo no es un escaneo WebAR ni usa la cámara. La imagen de la habitación matrimonial es una ilustración generada por IA, no una foto real del hostal. Las fotografías disponibles no incluyen medidas exactas de camas y el catálogo no confirma vistas al patio desde cada habitación.</p>
      </div>
    </section>

    <section class="page-shell tour-content">
      <div *ngIf="loading" class="tour-status" role="status" aria-live="polite">Cargando habitaciones…</div>
      <div *ngIf="errorMessage" class="tour-status tour-error" role="alert">
        <p>{{ errorMessage }}</p>
        <button class="tour-button" type="button" (click)="loadRooms()">Volver a intentar</button>
      </div>
      <p *ngIf="roomsWarning" class="tour-status" role="status">{{ roomsWarning }}</p>

      <ng-container *ngIf="!loading && rooms.length">
        <div class="room-picker" role="group" aria-label="Selecciona una habitación para explorar">
          <button
            *ngFor="let room of rooms"
            class="room-picker-button"
            type="button"
            [attr.aria-pressed]="selectedRoom?._id === room._id"
            (click)="selectRoom(room)">
            {{ room.type }}
          </button>
        </div>

        <section *ngIf="selectedRoom as room" class="tour-layout" aria-label="Recorrido de la habitación">
          <div class="tour-viewer-column">
            <div
              class="tour-viewer"
              role="region"
              tabindex="0"
              [attr.aria-label]="'Visor interactivo de ' + room.name + '. Usa las flechas izquierda y derecha para girar.'"
              (pointerdown)="startDrag($event)"
              (pointerup)="endDrag($event)"
              (pointercancel)="cancelDrag()"
              (keydown)="onViewerKeydown($event)">
              <img
                class="tour-room-image"
                [src]="roomImageUrl"
                [alt]="room.type === 'Matrimonial' ? 'Ilustración generada por IA de una habitación matrimonial ficticia en Cusco; imagen panorámica simulada, no corresponde al hostal' : room.name + ', fotografía del alojamiento; vista panorámica simulada, sin escala'"
                [style.transform]="imageTransform"
                draggable="false">
              <div class="viewer-shade" aria-hidden="true"></div>
              <div class="viewer-title">
                <span>{{ room.name }}</span>
                <span>{{ room.capacity }} {{ room.capacity === 1 ? 'huésped' : 'huéspedes' }}</span>
              </div>
              <div class="hotspots-layer" [style.transform]="imageTransform">
                <button
                  *ngFor="let hotspot of hotspots"
                  class="hotspot"
                  [class.selected]="activeHotspotId === hotspot.id"
                  type="button"
                  [style.top]="hotspot.top"
                  [style.left]="hotspot.left"
                  [attr.aria-label]="'Ver información: ' + hotspot.label"
                  [attr.aria-pressed]="activeHotspotId === hotspot.id"
                  (pointerdown)="$event.stopPropagation()"
                  (click)="showHotspot(hotspot.id)">
                  <span aria-hidden="true">+</span>
                  <span class="hotspot-label">{{ hotspot.label }}</span>
                </button>
              </div>
            </div>

            <div class="viewer-controls" role="group" aria-label="Controles para girar la vista">
              <button class="tour-button" type="button" aria-label="Girar vista a la izquierda" (click)="rotate(-20)">← Girar</button>
              <span class="view-angle" role="status" aria-live="polite">Vista simulada: {{ angle }}°</span>
              <button class="tour-button" type="button" aria-label="Girar vista a la derecha" (click)="rotate(20)">Girar →</button>
            </div>
            <p class="gesture-hint">En móvil, desliza horizontalmente. Con teclado, enfoca la imagen y usa ← / →. Los botones de giro son una alternativa a los gestos.</p>
          </div>

          <aside class="hotspot-details" aria-live="polite" aria-atomic="true">
            <p class="eyebrow">Punto de interés</p>
            <h2>{{ activeHotspotTitle }}</h2>
            <p>{{ activeHotspotDescription }}</p>
            <figure *ngIf="activeHotspotId === 'patio'">
              <img src="/assets/images/Vista-Comedorvista%202.jpg" alt="Patio y áreas comunes del hostal; el catálogo no indica que la habitación tenga vista directa al patio" loading="lazy">
              <figcaption>Área común del hostal. No se garantiza vista directa desde la habitación.</figcaption>
            </figure>
            <a class="primary-button reserve-room" data-direct-booking-navigation [routerLink]="['/reserva']" [queryParams]="{ roomId: room._id }">
              Reservar esta habitación ahora
            </a>
          </aside>
        </section>
      </ng-container>
    </section>
  `,
  styles: [`
    .tour-hero { background:#f2f1eb; padding:36px 0; }
    .tour-hero .section-title { margin-bottom:12px; }
    .tour-hero p { max-width:760px; color:#4f5b53; line-height:1.65; }
    .tour-disclosure { border-left:4px solid #a84e2c; padding:10px 14px; background:#fff; }
    .tour-content { padding-block:28px 56px; }
    .tour-status { padding:18px; border-radius:6px; background:#f3f5f2; color:#26362e; }
    .tour-error { border:1px solid #a12e21; background:#fff5f4; }
    .room-picker { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-bottom:20px; }
    .room-picker-button,.tour-button { display:inline-flex; min-width:48px; min-height:48px; align-items:center; justify-content:center; gap:8px; border:2px solid #183b32; border-radius:6px; background:#fff; padding:10px 14px; color:#183b32; font:inherit; font-weight:700; cursor:pointer; }
    .room-picker-button[aria-pressed="true"] { background:#183b32; color:#fff; }
    .tour-layout { display:grid; grid-template-columns:minmax(0,1.5fr) minmax(270px,.8fr); gap:24px; align-items:start; }
    .tour-viewer { position:relative; min-height:320px; aspect-ratio:16/10; overflow:hidden; border-radius:10px; background:#202a24; touch-action:pan-y; cursor:grab; }
    .tour-viewer:active { cursor:grabbing; }
    .tour-room-image { width:100%; height:100%; max-width:100%; object-fit:cover; user-select:none; transition:transform .18s ease-out; }
    .hotspots-layer { position:absolute; inset:0; pointer-events:none; transition:transform .18s ease-out; }
    .viewer-shade { position:absolute; inset:45% 0 0; pointer-events:none; background:linear-gradient(transparent,#101714aa); }
    .viewer-title { position:absolute; right:16px; bottom:14px; left:16px; display:flex; justify-content:space-between; gap:12px; color:#fff; font-weight:700; text-shadow:0 1px 5px #000; pointer-events:none; }
    .hotspot { position:absolute; z-index:2; display:grid; width:48px; min-width:48px; height:48px; min-height:48px; place-content:center; border:2px solid #fff; border-radius:50%; background:#183b32; color:#fff; font-size:22px; font-weight:800; cursor:pointer; box-shadow:0 2px 10px #0008; pointer-events:auto; }
    .hotspot.selected { background:#a84e2c; outline:3px solid #fff; outline-offset:2px; }
    .hotspot-label { position:absolute; top:50px; left:50%; border-radius:4px; background:#17221f; padding:4px 7px; color:#fff; font-size:12px; font-weight:700; white-space:nowrap; transform:translateX(-50%); }
    .viewer-controls { display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:center; margin-top:12px; }
    .viewer-controls .tour-button:last-child { justify-self:end; }
    .view-angle { color:#34443a; font-size:13px; font-weight:700; text-align:center; }
    .gesture-hint { margin:10px 0 0; color:#59635d; font-size:13px; line-height:1.5; }
    .hotspot-details { border:1px solid #dfe5dc; border-radius:8px; background:#fff; padding:20px; }
    .hotspot-details h2 { margin:8px 0; color:#183b32; font-family:Georgia,"Times New Roman",serif; font-size:1.6rem; font-weight:500; }
    .hotspot-details > p:not(.eyebrow) { color:#4f5b53; line-height:1.65; }
    .hotspot-details figure { margin:16px 0; }
    .hotspot-details figure img { display:block; width:100%; max-width:100%; height:auto; border-radius:6px; }
    .hotspot-details figcaption { margin-top:7px; color:#59635d; font-size:12px; line-height:1.5; }
    .reserve-room { width:100%; text-align:center; }
    @media(max-width:767px) {
      .tour-hero { padding-block:26px; }
      .tour-content { padding-bottom:24px; }
      .tour-layout { grid-template-columns:1fr; }
      .tour-viewer { min-height:240px; aspect-ratio:4/3; }
    }
    @media(min-width:768px) { .room-picker { grid-template-columns:repeat(4,minmax(0,1fr)); } }
    @media(max-width:420px) {
      .room-picker { grid-template-columns:1fr 1fr; gap:8px; }
      .room-picker-button { padding-inline:8px; font-size:13px; }
      .viewer-controls { grid-template-columns:1fr 1fr; }
      .view-angle { grid-column:1/-1; grid-row:1; }
      .viewer-controls .tour-button:last-child { justify-self:stretch; }
    }
    @media(prefers-reduced-motion:reduce) { .tour-room-image { transition:none; } }
  `]
})
export class TourArComponent implements OnInit {
  readonly hotspots: TourHotspot[] = [
    { id: 'bed', label: 'Cama', top: '48%', left: '28%' },
    { id: 'bath', label: 'Baño', top: '38%', left: '58%' },
    { id: 'patio', label: 'Patio', top: '55%', left: '80%' }
  ];

  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  loading = true;
  errorMessage = '';
  roomsWarning = '';
  angle = 0;
  activeHotspotId: HotspotId = 'bed';
  private requestedRoomId: string | null = null;
  private dragStartX: number | null = null;

  constructor(private readonly roomService: RoomService, private readonly route: ActivatedRoute) {}

  get roomImageUrl(): string {
    if (!this.selectedRoom) return '';
    return this.selectedRoom.type === 'Matrimonial'
      ? '/assets/images/habitacion-prototipo-generada.png'
      : getRoomImageUrl(this.selectedRoom.type);
  }

  get imageTransform(): string {
    const radians = this.angle * Math.PI / 180;
    const horizontalOffset = Math.sin(radians) * 3;
    const perspectiveRotation = Math.sin(radians) * 2;
    return `translateX(${horizontalOffset}%) scale(1.08) rotateY(${perspectiveRotation}deg)`;
  }

  get activeHotspotTitle(): string {
    return this.hotspots.find((hotspot) => hotspot.id === this.activeHotspotId)?.label ?? '';
  }

  get activeHotspotDescription(): string {
    if (!this.selectedRoom) return '';
    switch (this.activeHotspotId) {
      case 'bed':
        return this.bedDescription(this.selectedRoom);
      case 'bath':
        return 'El catálogo del hostal indica que esta habitación cuenta con baño privado y agua caliente las 24 horas.';
      case 'patio':
        return 'El hostal cuenta con patio y áreas comunes. La información disponible no confirma que esta habitación tenga una vista directa al patio.';
    }
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.requestedRoomId = params.get('roomId');
      this.selectRequestedRoom();
    });
    this.rooms = this.roomService.getCachedRooms();
    this.selectRequestedRoom();
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = this.rooms.length === 0;
    this.errorMessage = '';
    this.roomsWarning = '';
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
        this.selectRequestedRoom();
      },
      error: () => {
        this.loading = false;
        if (this.rooms.length) {
          this.roomsWarning = 'No pudimos actualizar el catálogo; se muestran las habitaciones guardadas en este navegador.';
        } else {
          this.errorMessage = 'No pudimos cargar las habitaciones. Comprueba tu conexión e inténtalo nuevamente.';
        }
      }
    });
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
    this.angle = 0;
    this.activeHotspotId = 'bed';
  }

  rotate(degrees: number): void {
    this.angle = ((this.angle + degrees) % 360 + 360) % 360;
  }

  showHotspot(id: HotspotId): void {
    this.activeHotspotId = id;
  }

  startDrag(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    this.dragStartX = event.clientX;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  endDrag(event: PointerEvent): void {
    if (this.dragStartX === null) return;
    const delta = this.dragStartX - event.clientX;
    this.dragStartX = null;
    if (Math.abs(delta) >= 4) this.rotate(Math.round(delta * 0.5));
  }

  cancelDrag(): void {
    this.dragStartX = null;
  }

  onViewerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.rotate(-20);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.rotate(20);
    }
  }

  private selectRequestedRoom(): void {
    if (!this.rooms.length) return;
    const requestedRoom = this.rooms.find((room) => room._id === this.requestedRoomId);
    const room = requestedRoom ?? this.rooms[0];
    if (this.selectedRoom?._id !== room._id) this.selectRoom(room);
  }

  private bedDescription(room: Room): string {
    const bedDescriptions: Record<Room['type'], string> = {
      Simple: 'El catálogo describe una cama individual. No publica sus medidas exactas; consulta con recepción si necesitas esa información.',
      Doble: 'El catálogo describe dos camas individuales. No publica sus medidas exactas; consulta con recepción si necesitas esa información.',
      Matrimonial: 'El catálogo describe una cama doble. No publica sus medidas exactas; consulta con recepción si necesitas esa información.',
      Familiar: `Habitación para hasta ${room.capacity} personas. El catálogo no especifica la distribución ni las medidas de las camas; consulta con recepción.`
    };
    return bedDescriptions[room.type];
  }
}
