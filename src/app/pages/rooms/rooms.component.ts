import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoomCardComponent } from '../../components/room-card/room-card.component';
import { Room } from '../../models/room.interface';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, RouterModule, RoomCardComponent],
  template: `
    <section class="page-banner">
      <div class="page-shell py-16 sm:py-24">
        <p class="eyebrow">Un lugar para descansar</p>
        <h1 class="section-title max-w-3xl">Habitaciones sencillas, cómodas y listas para recibirte.</h1>
        <p class="max-w-2xl leading-7 text-stone-600">Elige el espacio ideal para tu viaje. Todas las tarifas son por noche e incluyen los servicios indicados.</p>
      </div>
    </section>
    <section class="page-shell highlights-section" aria-labelledby="highlights-title">
      <h2 id="highlights-title">Puntos fuertes del alojamiento</h2>
      <div class="strength-cards">
        <div class="strength-card">
          <span class="strength-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 11h16l1 9h-2l-.4-3H5.4L5 20H3l1-9Zm2-2a3 3 0 1 1 6 0H6Zm7 0a3 3 0 1 1 6 0h-6Z"/></svg></span>
          <span><strong>Parking</strong><small>Estacionamiento disponible</small></span>
        </div>
        <div class="strength-card">
          <span class="strength-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 3h13v11a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V3Zm2 2v9a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3V5H6Zm13 2h1a3 3 0 0 1 0 6h-1v-2h1a1 1 0 0 0 0-2h-1V7ZM8 21h10v-2H8v2Z"/></svg></span>
          <span><strong>Desayuno continental</strong><small>Para empezar el día en Cusco</small></span>
        </div>
        <div class="strength-card">
          <span class="strength-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-5.7-2.3 1.4 1.4a6.1 6.1 0 0 1 8.6 0l1.4-1.4a8.1 8.1 0 0 0-11.4 0Zm-4-4 1.4 1.4a11.7 11.7 0 0 1 16.6 0l1.4-1.4a13.7 13.7 0 0 0-19.4 0Zm4-4 1.4 1.4a6.1 6.1 0 0 1 8.6 0l1.4-1.4a8.1 8.1 0 0 0-11.4 0Z"/></svg></span>
          <span><strong>Wi-Fi gratis</strong><small>Conexión en todo el alojamiento</small></span>
        </div>
        <div class="strength-card">
          <span class="strength-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 13h2V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5h2v6h-2v2h-2v-2H7v2H5v-2H3v-6Zm4-5v5h10V8H7Zm1 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg></span>
          <span><strong>Traslado al aeropuerto</strong><small>Consulta disponibilidad y tarifa</small></span>
        </div>
      </div>
      <div class="property-summary">
        <div class="property-description">
          <p>Chaquill Chak'a está en el centro de Cusco y ofrece salón de uso común, recepción las 24 horas, cocina compartida y Wi-Fi gratis en todo el alojamiento.</p>
          <p>Todas las habitaciones cuentan con baño privado, TV, artículos de aseo y ropa de cama. Se sirve desayuno continental.</p>
          <div class="popular-services" aria-label="Servicios populares">
            <span>Recepción 24 horas</span><span>Cocina compartida</span><span>Servicio de lavandería</span><span>Habitaciones familiares</span>
          </div>
        </div>
        <aside class="location-score">
          <p><strong>En el corazón de Cusco</strong><br>Una ubicación muy valorada por quienes visitan la ciudad.</p>
          <div><span>Ubicación</span><strong>9,4 / 10</strong></div>
          <div><span>Ideal para parejas</span><strong>9,5 / 10</strong></div>
          <small>Información compartida de Booking.com; las puntuaciones pueden variar.</small>
        </aside>
      </div>
    </section>
    <section class="page-shell pb-20">
      <p *ngIf="loading" class="py-14 text-center text-stone-600" role="status">Cargando habitaciones…</p>
      <div *ngIf="errorMessage" class="my-10 rounded border border-rose-200 bg-rose-50 p-6 text-center text-rose-900" role="alert">
        <p>{{ errorMessage }}</p><button class="text-link" type="button" (click)="loadRooms(true)">Volver a intentar</button>
      </div>
      <p *ngIf="roomsWarning" class="my-5 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status">{{ roomsWarning }}</p>
      <div *ngIf="!loading && !errorMessage && rooms.length" class="grid gap-6 md:grid-cols-2">
        <app-room-card *ngFor="let room of rooms" [room]="room"></app-room-card>
      </div>
      <div *ngIf="!loading && !errorMessage && !rooms.length" class="py-14 text-center">
        <h2 class="font-serif text-2xl text-forest">No hay habitaciones disponibles por el momento.</h2>
        <a routerLink="/ubicacion" class="text-link">Escríbenos para más información</a>
      </div>
    </section>
  `,
  styles: [`
    .page-banner{background:#f2f1eb}.page-banner .section-title{font-size:clamp(2.3rem,5vw,4rem)}
    .highlights-section{padding-block:35px 55px}
    .highlights-section h2{margin:0 0 17px;color:#183b32;font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.55rem,3vw,2rem);font-weight:500}
    .strength-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
    .strength-card{display:flex;min-height:70px;align-items:center;gap:11px;border:1px solid #e3e5df;border-radius:6px;background:#fff;padding:12px}
    .strength-icon{display:grid;width:38px;height:38px;flex:none;place-items:center;border-radius:50%;background:#edf3ed;color:#183b32}
    .strength-icon svg{width:21px;height:21px;fill:currentColor}
    .strength-card strong,.strength-card small{display:block}
    .strength-card strong{color:#27372f;font-size:13px}
    .strength-card small{margin-top:4px;color:#66716a;font-size:11px;line-height:1.4}
    .property-summary{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:25px;margin-top:22px}
    .property-description{color:#4f5b53;font-size:14px;line-height:1.75}
    .property-description p{margin:0 0 12px}
    .popular-services{display:flex;flex-wrap:wrap;gap:12px 20px;margin-top:15px;color:#315342;font-size:13px}
    .popular-services span::before{content:"•";margin-right:7px;color:#a84e2c;font-weight:800}
    .location-score{align-self:start;border-radius:7px;background:#edf3fa;padding:17px;color:#283b4c;font-size:13px}
    .location-score p{margin:0 0 15px;line-height:1.6}
    .location-score div{display:flex;justify-content:space-between;gap:10px;margin:8px 0}
    .location-score small{display:block;margin-top:13px;color:#566675;font-size:10px;line-height:1.5}
    @media(max-width:760px){.strength-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.property-summary{grid-template-columns:1fr}}
    @media(max-width:440px){.strength-cards{grid-template-columns:1fr}.highlights-section{padding-block:28px 40px}}
  `]
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  errorMessage = '';
  roomsWarning = '';

  constructor(private readonly roomService: RoomService) {}

  ngOnInit(): void {
    this.rooms = this.roomService.getCachedRooms();
    this.loading = this.rooms.length === 0;
    this.loadRooms();
  }

  loadRooms(refresh = false): void {
    this.loading = this.rooms.length === 0;
    this.errorMessage = '';
    this.roomsWarning = '';
    const roomsRequest = refresh ? this.roomService.refreshRooms() : this.roomService.getRooms();
    roomsRequest.subscribe({
      next: (rooms) => { this.rooms = rooms; this.loading = false; },
      error: () => {
        if (this.rooms.length > 0) {
          this.roomsWarning = 'Mostramos el catálogo guardado en este navegador; no se pudo actualizar ahora.';
        } else {
          this.errorMessage = 'No pudimos cargar el catálogo. Asegúrate de que el servidor esté disponible.';
        }
        this.loading = false;
      }
    });
  }
}
