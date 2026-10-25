import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-navbar></app-navbar>
    <main id="contenido" tabindex="-1">
      <router-outlet></router-outlet>
    </main>
    <div class="sr-only" role="status" aria-live="polite">{{ routeAnnouncement }}</div>
    <footer class="site-footer">
      <div class="page-shell footer-content">
        <div class="footer-social">
          <a
            class="facebook-link"
            href="https://www.facebook.com/share/1RXQFG7D6Q/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visita Chaquill Chak'a en Facebook (abre una pestaña nueva)">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M13.5 21v-7.2h2.4l.36-2.8H13.5V9.2c0-.81.23-1.36 1.4-1.36h1.49V5.33A20 20 0 0 0 14.22 5c-2.15 0-3.62 1.31-3.62 3.72V11H8.17v2.8h2.43V21h2.9Z"/>
            </svg>
            <span>Facebook</span>
          </a>
        </div>
        <a routerLink="/inicio" class="footer-logo" aria-label="Chaquill Chak'a, volver al inicio">
          <img src="/assets/images/chaquillchaja-logo.png" alt="Chaquill Chak'a desde 2008">
        </a>
        <div class="footer-contact">
          <a href="tel:+5184211511">Teléfono: +51 84 211 511</a>
          <a href="tel:+51984992475">WhatsApp: +51 984 992 475</a>
          <a href="mailto:reservas@chaquillchaka.com.pe">reservas@chaquillchaka.com.pe</a>
          <span>Dirección: Calle Belén N.° 418, Cusco</span>
          <a routerLink="/reserva">Haz una reservación directa</a>
        </div>
        <span class="footer-copyright">© {{ currentYear }} Chaquill Chak'a Hostal · Cusco, Perú</span>
      </div>
    </footer>
    <app-whatsapp-floating-button></app-whatsapp-floating-button>
  `,
  styles: [`
    .site-footer { background:var(--paper); border-top:1px solid #e5e6df; padding:28px 0; color:var(--forest); }
    .footer-content { display:grid; grid-template-columns:1fr auto 1fr; gap:20px 30px; align-items:center; }
    .footer-social { justify-self:start; }
    .facebook-link { display:inline-flex; align-items:center; gap:9px; color:var(--forest); font-size:14px; font-weight:700; text-decoration:none; }
    .facebook-link svg { width:36px; height:36px; border:1px solid var(--forest); border-radius:50%; fill:white; background:var(--forest); padding:8px; }
    .facebook-link:hover { text-decoration:underline; text-underline-offset:4px; }
    .footer-logo img { display:block; width:138px; height:auto; }
    .footer-contact { display:flex; flex-direction:column; align-items:flex-end; gap:6px; font-size:12px; text-align:right; }
    .footer-contact a { color:var(--forest); text-decoration:underline; text-underline-offset:3px; }
    .footer-copyright { grid-column:1/-1; border-top:1px solid #e5e6df; padding-top:14px; color:var(--muted); font-size:12px; text-align:center; }
    @media(max-width:620px) {
      .footer-content { grid-template-columns:1fr 1fr; }
      .footer-logo { justify-self:end; }
      .footer-contact { grid-column:1/-1; align-items:center; text-align:center; }
    }
  `]
})
export class AppComponent implements OnInit {
  readonly currentYear = new Date().getFullYear();
  routeAnnouncement = '';

  constructor(private readonly router: Router, private readonly title: Title) {}

  ngOnInit(): void {
    let firstNavigation = true;
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (firstNavigation) {
        firstNavigation = false;
        return;
      }
      setTimeout(() => {
        this.routeAnnouncement = `Página cargada: ${this.title.getTitle()}`;
        document.getElementById('contenido')?.focus({ preventScroll: true });
      });
    });
  }
}
