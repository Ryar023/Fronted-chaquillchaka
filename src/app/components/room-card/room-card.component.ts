import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Room, RoomOccupancy } from '../../models/room.interface';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article class="surface-card overflow-hidden" [attr.aria-labelledby]="'room-title-' + room._id">
      <div class="room-image-wrap">
        <button class="room-image-button" type="button" (click)="openGallery()" [attr.aria-label]="'Ver fotos y detalles de ' + room.name">
          <img
            class="room-image"
            [src]="roomImageUrl"
            [alt]="room.name + ', habitación con capacidad para ' + room.capacity + ' personas'"
            loading="lazy"
            (click)="openGallery()"
            (error)="useFallback($event)">
          <span class="view-photos" aria-hidden="true">Ver detalles y fotos</span>
        </button>
        <span class="room-type">{{ room.type }}</span>
      </div>
      <div class="p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="m-0 font-serif text-2xl font-medium text-forest" [id]="'room-title-' + room._id">{{ room.name }}</h3>
            <p class="mt-2 text-sm leading-6 text-stone-600">{{ room.description }}</p>
          </div>
          <span class="capacity" [attr.aria-label]="'Capacidad: ' + room.capacity + ' personas'">♧ {{ room.capacity }}</span>
        </div>
        <button class="details-button" type="button" (click)="openGallery()">
          Ver detalles y fotos <span aria-hidden="true">→</span>
        </button>
        <ul class="mt-5 flex flex-wrap gap-2 p-0" aria-label="Servicios incluidos">
          <li *ngFor="let service of room.services" class="service-badge">{{ service }}</li>
        </ul>
        <section class="occupied" aria-label="Disponibilidad de la habitación" aria-live="polite">
          <p *ngIf="!occupied.length" class="occupied-free">Sin reservas próximas registradas.</p>
          <ng-container *ngIf="occupied.length">
            <p class="occupied-title">Fechas ya reservadas</p>
            <ul>
              <li *ngFor="let range of occupied">{{ range.checkIn | date:'dd/MM/yyyy':'UTC' }} → {{ range.checkOut | date:'dd/MM/yyyy':'UTC' }}</li>
            </ul>
          </ng-container>
        </section>
        <div class="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-stone-200 pt-5">
          <div>
            <p class="m-0 text-xs text-stone-500">Desde / noche</p>
            <p class="m-0 mt-1 font-semibold text-forest">S/ {{ room.pricePen | number:'1.0-0' }} <span class="font-normal text-stone-500">· &#36;{{ room.priceUsd | number:'1.0-0' }} USD</span></p>
          </div>
          <a class="primary-button" [routerLink]="['/reserva']" [queryParams]="{ roomId: room._id }">
            Reservar {{ room.type }} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>

    <div *ngIf="galleryOpen" class="gallery-backdrop" role="presentation" (click)="closeGallery()">
      <section
        class="gallery-dialog"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'Fotos y detalles de ' + room.name"
        (click)="$event.stopPropagation()">
        <button class="gallery-close" type="button" aria-label="Cerrar fotos y detalles" (click)="closeGallery()">×</button>
        <div class="gallery-layout">
          <div class="gallery-visual">
            <div class="gallery-main">
              <img [src]="galleryImages[currentImageIndex]" [alt]="'Foto ' + (currentImageIndex + 1) + ' de ' + room.name" (error)="useGalleryFallback($event)">
              <button *ngIf="galleryImages.length > 1" class="gallery-arrow previous" type="button" aria-label="Foto anterior" (click)="showPreviousImage()">‹</button>
              <button *ngIf="galleryImages.length > 1" class="gallery-arrow next" type="button" aria-label="Foto siguiente" (click)="showNextImage()">›</button>
              <div *ngIf="galleryImages.length > 1" class="gallery-count">{{ currentImageIndex + 1 }} / {{ galleryImages.length }}</div>
            </div>
            <p class="gallery-caption">{{ galleryCaptions[currentImageIndex] }}</p>
            <div *ngIf="galleryImages.length > 1" class="gallery-thumbnails" aria-label="Seleccionar foto">
              <button
                *ngFor="let photo of galleryImages; let index = index"
                type="button"
                [class.selected]="currentImageIndex === index"
                [attr.aria-label]="'Mostrar foto ' + (index + 1)"
                [attr.aria-pressed]="currentImageIndex === index"
                (click)="showImage(index)">
                <img [src]="photo" alt="" (error)="useGalleryFallback($event)">
              </button>
            </div>
          </div>
          <div class="gallery-details">
            <p class="eyebrow">Tu espacio en Cusco</p>
            <h2>{{ room.name }}</h2>
            <div class="detail-badges">
              <span *ngFor="let service of room.services | slice:0:3">{{ service }}</span>
            </div>
            <p class="detail-capacity"><strong>Capacidad:</strong> hasta {{ room.capacity }} {{ room.capacity === 1 ? 'persona' : 'personas' }}</p>
            <p class="detail-beds">{{ bedDescription }}</p>
            <p class="detail-description">{{ room.description }}</p>
            <h3>En tu habitación</h3>
            <ul class="detail-list">
              <li *ngFor="let service of detailServices">{{ service }}</li>
            </ul>
            <p class="detail-price">Desde <strong>S/ {{ room.pricePen | number:'1.0-0' }}</strong> por noche <span>· &#36;{{ room.priceUsd | number:'1.0-0' }} USD</span></p>
            <a class="primary-button reserve-link" [routerLink]="['/reserva']" [queryParams]="{ roomId: room._id }" (click)="closeGallery()">
              Reservar esta habitación <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .room-image-wrap { position:relative; height:235px; overflow:hidden; background:#e8e7dd; }
    .room-image-button { position:absolute; inset:0; width:100%; height:100%; border:0; padding:0; background:transparent; cursor:pointer; }
    .room-image { width:100%; height:100%; object-fit:cover; transition:transform .5s; }
    .room-image-button:hover .room-image { transform:scale(1.035); }
    .view-photos { position:absolute; right:13px; bottom:13px; border-radius:4px; background:#17221fd9; padding:8px 11px; color:#fff; font-size:12px; font-weight:700; }
    .room-type { position:absolute; left:16px; bottom:16px; border-radius:3px; background:#fff; padding:7px 11px; color:#183b32; font-size:12px; font-weight:750; pointer-events:none; }
    .details-button { display:inline-flex; min-height:44px; align-items:center; gap:8px; margin-top:16px; border:1px solid #183b32; border-radius:4px; background:#fff; padding:9px 12px; color:#183b32; font-size:13px; font-weight:700; cursor:pointer; }
    .details-button:hover { background:#edf1ec; }
    .capacity { flex:none; border-radius:99px; background:#edf1ec; padding:6px 9px; color:#183b32; font-size:12px; font-weight:700; }
    .service-badge { list-style:none; border:1px solid #e4e7e2; border-radius:99px; padding:5px 9px; color:#4b5750; font-size:11px; }
    .gallery-backdrop { position:fixed; z-index:1000; inset:0; display:grid; place-items:center; overflow-y:auto; background:#101714b8; padding:24px; }
    .gallery-dialog { position:relative; width:min(1120px,100%); max-height:calc(100vh - 48px); overflow-y:auto; border-radius:9px; background:#fff; padding:24px; box-shadow:0 24px 80px #0005; }
    .gallery-close { position:absolute; z-index:2; top:9px; right:12px; width:40px; height:40px; border:0; border-radius:50%; background:#fff; color:#26332c; font-size:27px; line-height:1; cursor:pointer; }
    .gallery-layout { display:grid; grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr); gap:26px; align-items:start; }
    .gallery-main { position:relative; height:390px; overflow:hidden; border-radius:6px; background:#f1f0e9; }
    .gallery-main>img { width:100%; height:100%; object-fit:cover; }
    .gallery-arrow { position:absolute; top:50%; width:42px; height:42px; transform:translateY(-50%); border:0; border-radius:50%; background:#fff; color:#183b32; font-size:27px; line-height:1; box-shadow:0 2px 12px #0002; cursor:pointer; }
    .gallery-arrow.previous { left:12px; }
    .gallery-arrow.next { right:12px; }
    .gallery-count { position:absolute; right:12px; bottom:12px; border-radius:20px; background:#17221fc9; padding:5px 10px; color:white; font-size:12px; }
    .gallery-caption { margin:9px 0 0; color:#59635d; font-size:12px; }
    .gallery-thumbnails { display:flex; gap:9px; overflow-x:auto; padding-top:10px; }
    .gallery-thumbnails button { flex:none; width:78px; height:58px; overflow:hidden; border:2px solid transparent; border-radius:5px; padding:0; background:#eee; cursor:pointer; }
    .gallery-thumbnails button.selected { border-color:#183b32; }
    .gallery-thumbnails img { width:100%; height:100%; object-fit:cover; }
    .gallery-details { padding:14px 12px 8px 0; }
    .gallery-details h2 { margin:0 38px 14px 0; color:#183b32; font-family:Georgia,"Times New Roman",serif; font-size:clamp(1.7rem,3vw,2.25rem); font-weight:500; }
    .detail-badges { display:flex; flex-wrap:wrap; gap:7px; }
    .detail-badges span { border:1px solid #dfe4dd; border-radius:4px; padding:5px 8px; color:#46534b; font-size:12px; }
    .detail-capacity,.detail-beds,.detail-description { color:#4f5b53; line-height:1.65; }
    .gallery-details h3 { margin:20px 0 8px; color:#183b32; font-size:14px; }
    .detail-list { display:grid; grid-template-columns:1fr 1fr; gap:7px 14px; margin:0; padding:0; color:#4f5b53; font-size:13px; list-style:none; }
    .detail-list li::before { content:"✓"; margin-right:7px; color:#183b32; font-weight:800; }
    .detail-price { margin:22px 0 14px; color:#59635d; font-size:14px; }
    .detail-price strong { color:#183b32; font-size:19px; }
    .detail-price span { white-space:nowrap; }
    .reserve-link { width:100%; }
    .occupied { margin-top:16px; border-radius:6px; background:#fdf3e7; border:1px solid #e7c9a4; padding:10px 12px; font-size:13px; color:#5a3512; }
    .occupied p { margin:0; } .occupied-title { font-weight:700; } .occupied-free { color:#14532d; background:none; }
    .occupied ul { margin:6px 0 0; padding-left:18px; } .occupied-free:only-child { color:#14532d; }
    @media(max-width:760px) {
      .gallery-backdrop { padding:12px; }
      .gallery-dialog { max-height:calc(100vh - 24px); padding:14px; }
      .gallery-layout { grid-template-columns:1fr; gap:14px; }
      .gallery-main { height:min(55vh,360px); min-height:210px; }
      .gallery-details { padding:0 2px 4px; }
    }
    @media(max-width:420px) { .room-image-wrap{height:195px} .primary-button{width:100%} }
  `]
})
export class RoomCardComponent implements OnInit {
  @Input({ required: true }) room!: Room;
  occupied: RoomOccupancy[] = [];

  constructor(private readonly roomService: RoomService) {}

  ngOnInit(): void {
    this.roomService.getOccupancy().subscribe((all) => {
      this.occupied = all.filter((item) => item.roomId === this.room._id);
    });
  }
  readonly fallbackImage = '/assets/images/slide_habitacion.jpg';
  galleryOpen = false;
  galleryImages: string[] = [];
  galleryCaptions: string[] = [];
  currentImageIndex = 0;

  get roomImageUrl(): string {
    const imageByType: Record<Room['type'], string> = {
      Simple: 'habitacion-simple.jpg',
      Doble: 'habitacion-doble.jpg',
      Matrimonial: 'habitacion-matrimonial.jpg',
      Familiar: 'Habitacion familiar(2).jpg'
    };
    return `/assets/images/${encodeURIComponent(imageByType[this.room.type])}`;
  }

  get bedDescription(): string {
    const descriptions: Record<Room['type'], string> = {
      Simple: '1 cama individual',
      Doble: '2 camas individuales',
      Matrimonial: '1 cama doble',
      Familiar: `Habitación familiar para hasta ${this.room.capacity} personas`
    };
    return descriptions[this.room.type];
  }

  get detailServices(): string[] {
    const standardServices = ['Baño privado', 'Agua caliente', 'Ropa de cama y toallas'];
    const additionalServices = (this.room.services || [])
      .filter((service) => !/baño privado|agua caliente/i.test(service));
    return [...new Set([...standardServices, ...additionalServices])];
  }

  openGallery(): void {
    const photosByType: Record<Room['type'], Array<{ src: string; caption: string }>> = {
      Simple: [
        { src: this.roomImageUrl, caption: 'Habitación simple' },
        { src: '/assets/images/Desayuno%202.jpg', caption: 'Desayuno continental' }
      ],
      Doble: [
        { src: this.roomImageUrl, caption: 'Habitación doble' },
        { src: '/assets/images/Desayuno%202.jpg', caption: 'Desayuno continental' }
      ],
      Matrimonial: [
        { src: this.roomImageUrl, caption: 'Habitación matrimonial' },
        { src: '/assets/images/Desayuno%201.jpg', caption: 'Desayuno continental' },
        { src: '/assets/images/Desayuno%202.jpg', caption: 'Desayuno continental' }
      ],
      Familiar: [
        { src: this.roomImageUrl, caption: 'Habitación familiar' },
        { src: '/assets/images/slide_habitacion.jpg', caption: 'Habitación familiar' },
        { src: '/assets/images/Desayuno%201.jpg', caption: 'Desayuno continental' }
      ]
    };
    const slides = photosByType[this.room.type];
    this.galleryImages = slides.map((slide) => slide.src);
    this.galleryCaptions = slides.map((slide) => slide.caption);
    this.currentImageIndex = 0;
    this.galleryOpen = true;
  }

  closeGallery(): void {
    this.galleryOpen = false;
  }

  showImage(index: number): void {
    this.currentImageIndex = index;
  }

  showPreviousImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  showNextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeGallery();
  }

  useFallback(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.dataset['fallbackAttempted']) {
      image.dataset['fallbackAttempted'] = 'true';
      image.src = this.fallbackImage;
    }
  }

  useGalleryFallback(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.dataset['fallbackAttempted']) {
      image.dataset['fallbackAttempted'] = 'true';
      image.src = this.fallbackImage;
    }
  }
}
