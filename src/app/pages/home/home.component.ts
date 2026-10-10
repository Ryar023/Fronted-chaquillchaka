import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoomCardComponent } from '../../components/room-card/room-card.component';
import { Room } from '../../models/room.interface';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, RoomCardComponent],
  template: `
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="page-shell hero-content">
        <p class="eyebrow text-amber-200">Tu casa en el corazón de Cusco</p>
        <h1>Hospédate en el corazón<br class="hidden sm:block"> histórico de Cusco.</h1>
        <p class="hero-copy">Una bienvenida cálida, descanso auténtico y la ciudad a unos pasos de ti.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/habitaciones" class="primary-button hero-button">Descubre nuestras habitaciones <span aria-hidden="true">→</span></a>
          <a routerLink="/ubicacion" class="hero-outline">Conoce nuestra ubicación</a>
        </div>
        <span class="hero-caption">Calle Belén 418 · Centro Histórico, Cusco</span>
      </div>
    </section>

    <section class="page-shell intro-section">
      <div>
        <p class="eyebrow">Bienvenidos a casa</p>
        <h2 class="section-title">Una pausa tranquila,<br>cerca de todo lo que importa.</h2>
      </div>
      <div class="intro-copy">
        <p class="leading-7 text-stone-600">Desde nuestro hostal, las calles de piedra, mercados y plazas de Cusco se descubren caminando. Al volver, te espera un espacio sencillo, cómodo y pensado para descansar.</p>
        <a routerLink="/nosotros" class="text-link">Conoce Chaquill Chak'a →</a>
      </div>
    </section>

    <section class="rooms-section">
      <div class="page-shell py-20">
        <div class="flex flex-wrap items-end justify-between gap-5">
          <div><p class="eyebrow">Descanso a tu manera</p><h2 class="section-title">Nuestras habitaciones</h2></div>
          <a routerLink="/habitaciones" class="text-link">Ver todas las habitaciones →</a>
        </div>
        <p *ngIf="loading" class="py-10 text-center text-stone-600" role="status">Estamos preparando las habitaciones para ti…</p>
        <div *ngIf="errorMessage" class="my-8 rounded border border-rose-200 bg-rose-50 p-5 text-center text-rose-900" role="alert">
          <p>{{ errorMessage }}</p><button class="text-link" type="button" (click)="loadRooms(true)">Intentar de nuevo</button>
        </div>
        <p *ngIf="roomsWarning" class="my-5 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status">{{ roomsWarning }}</p>
        <div *ngIf="!loading && !errorMessage && rooms.length" class="mt-8 grid gap-6 md:grid-cols-2">
          <app-room-card *ngFor="let room of rooms | slice:0:2" [room]="room"></app-room-card>
        </div>
      </div>
    </section>

    <section class="page-shell experience">
      <div class="experience-photo" role="img" aria-label="Patio soleado del hostal Chaquill Chak'a"></div>
      <div class="experience-copy">
        <p class="eyebrow">Cusco se vive caminando</p>
        <h2 class="section-title">Todo comienza a la vuelta de la esquina.</h2>
        <p class="leading-7 text-stone-600">Disfruta una ubicación práctica para explorar el centro histórico, conocer su cultura y volver a descansar cuando quieras.</p>
        <a routerLink="/ubicacion" class="primary-button mt-5">Cómo llegar <span aria-hidden="true">→</span></a>
      </div>
    </section>
  `,
  styles: [`
    .hero { position:relative; min-height:610px; display:flex; align-items:center; color:white; background:#263c35 url('https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?auto=format&fit=crop&w=2200&q=85') center 52%/cover no-repeat; }
    .hero-overlay { position:absolute; inset:0; background:linear-gradient(90deg,#111f1bdc 0%,#111f1ba8 49%,#111f1b18 100%); }
    .hero-content { position:relative; padding-block:80px; }
    .hero h1 { max-width:780px; margin:17px 0; font-family:Georgia,"Times New Roman",serif; font-size:clamp(3rem,7.6vw,6.3rem); font-weight:500; line-height:.99; letter-spacing:-.045em; }
    .hero-copy { max-width:480px; margin:20px 0 0; color:#f0eee8; font-size:clamp(1rem,2vw,1.2rem); line-height:1.7; }
    .hero-button { border-color:#fff; background:#fff; color:#183b32; }
    .hero-button:hover { background:#f1eee6; color:#183b32; }
    .hero-outline { display:inline-flex; min-height:48px; align-items:center; border:1px solid #ffffffa6; border-radius:4px; padding:0 15px; color:white; font-size:.9rem; font-weight:700; text-decoration:none; }
    .hero-outline:hover { background:#ffffff1a; }
    .hero-caption { position:absolute; right:0; bottom:25px; color:#fff; font-size:12px; }
    .intro-section { display:grid; grid-template-columns:1fr 1fr; gap:12%; align-items:end; padding-block:92px; }
    .intro-copy p { margin:0 0 20px; }
    .rooms-section { background:#f2f1eb; }
    .experience { display:grid; grid-template-columns:1.1fr .9fr; gap:clamp(35px,8vw,100px); align-items:center; padding-block:90px; }
    .experience-photo { min-height:370px; border-radius:6px; background:#d3cabe url('/assets/images/slide_PatioD%C3%ADa1.jpg') center/cover; }
    .experience-copy .section-title { max-width:510px; }
    @media(max-width:700px) {
      .hero{min-height:590px;background-position:58% center}.hero-overlay{background:linear-gradient(90deg,#111f1bdc 0%,#111f1ba8 70%,#111f1b68)}
      .hero-content{padding-block:65px}.hero-caption{right:auto;left:0}.intro-section{grid-template-columns:1fr;gap:12px;padding-block:65px}
      .experience{grid-template-columns:1fr;padding-block:65px}.experience-photo{min-height:270px}
    }
  `]
})
export class HomeComponent implements OnInit {
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
          this.errorMessage = 'No pudimos cargar las habitaciones. Comprueba tu conexión e inténtalo de nuevo.';
        }
        this.loading = false;
      }
    });
  }
}
