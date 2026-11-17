import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="bottom-nav" aria-label="Navegación móvil">
      <a routerLink="/inicio" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page">
        <span aria-hidden="true">⌂</span><span>Inicio</span>
      </a>
      <a routerLink="/habitaciones" routerLinkActive="active" ariaCurrentWhenActive="page">
        <span aria-hidden="true">▤</span><span>Habitaciones</span>
      </a>
      <a routerLink="/tour-ar" routerLinkActive="active" ariaCurrentWhenActive="page">
        <span aria-hidden="true">360°</span><span>Tour AR</span>
      </a>
      <a routerLink="/reserva" routerLinkActive="active" ariaCurrentWhenActive="page">
        <span aria-hidden="true">✓</span><span>Reservar</span>
      </a>
    </nav>
  `,
  styles: [`
    :host { display:none; }
    .bottom-nav { position:fixed; right:0; bottom:0; left:0; z-index:50; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:4px; border-top:1px solid #cbd5ce; background:#fff; padding:6px 8px calc(6px + env(safe-area-inset-bottom)); box-shadow:0 -4px 18px #17221f12; }
    .bottom-nav a { display:flex; min-width:0; min-height:52px; flex-direction:column; align-items:center; justify-content:center; gap:2px; border-radius:6px; color:#34443a; font-size:11px; font-weight:700; line-height:1.2; text-decoration:none; }
    .bottom-nav a > span:first-child { font-size:18px; line-height:1; }
    .bottom-nav a.active { background:#e9f0eb; color:#183b32; outline:2px solid #183b32; outline-offset:-2px; }
    .bottom-nav a:focus-visible { outline:3px solid #0284c7; outline-offset:-3px; }
    @media (max-width:767px) { :host { display:block; } }
    :host([hidden]) { display:none !important; }
  `]
})
export class BottomNavComponent {}
