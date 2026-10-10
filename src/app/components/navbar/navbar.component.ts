import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    <header class="sticky top-0 z-40 border-b border-stone-200/80 bg-white/95 backdrop-blur">
      <div class="page-shell flex min-h-[76px] items-center justify-between gap-5">
        <a routerLink="/inicio" class="brand flex items-center gap-3 no-underline" aria-label="Chaquill Chak'a, inicio">
          <img class="brand-logo" src="/assets/images/chaquillchaja-logo.png" alt="Chaquill Chak'a, desde 2008">
        </a>
        <button
          type="button"
          class="menu-toggle"
          (click)="toggleMenu()"
          [attr.aria-expanded]="menuOpen"
          aria-controls="site-navigation"
          [attr.aria-label]="menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'">
          <span></span><span></span><span></span>
        </button>
        <nav id="site-navigation" class="site-nav" [class.is-open]="menuOpen" aria-label="Navegación principal">
          <a routerLink="/inicio" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMenu()">Inicio</a>
          <a routerLink="/habitaciones" routerLinkActive="active" (click)="closeMenu()">Habitaciones</a>
          <a routerLink="/ubicacion" routerLinkActive="active" (click)="closeMenu()">Ubicación</a>
          <a routerLink="/nosotros" routerLinkActive="active" (click)="closeMenu()">Nosotros</a>
          <a routerLink="/reserva" class="nav-booking" (click)="closeMenu()">Haz una reservación <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    :host { display:block; }
    .brand-logo { display:block; width:148px; height:auto; }
    .site-nav { display:flex; align-items:center; gap:clamp(14px,2.4vw,31px); }
    .site-nav a { color:#39443e; font-size:13px; font-weight:650; text-decoration:none; white-space:nowrap; }
    .site-nav a:hover,.site-nav a.active { color:#a84e2c; }
    .site-nav .nav-booking { border-radius:4px; background:#183b32; padding:12px 15px; color:white; }
    .site-nav .nav-booking:hover { background:#245447; color:white; }
    .menu-toggle { display:none; border:0; background:transparent; padding:9px; }
    .menu-toggle span { display:block; width:23px; height:2px; margin:5px; background:#183b32; }
    .skip-link { position:absolute; top:-60px; left:12px; z-index:60; border-radius:4px; background:#183b32; padding:10px 14px; color:#fff; }
    .skip-link:focus { top:8px; }
    @media (max-width:760px) {
      .brand-logo { width:130px; }
      .menu-toggle { display:block; }
      .site-nav { position:absolute; top:75px; right:0; left:0; display:none; align-items:stretch; gap:0; border-bottom:1px solid #e5e7eb; background:white; padding:8px 20px 18px; box-shadow:0 16px 22px #17221f12; }
      .site-nav.is-open { display:flex; flex-direction:column; }
      .site-nav a { padding:13px 8px; }
      .site-nav .nav-booking { margin-top:6px; text-align:center; }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
