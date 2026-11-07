import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AccessibilitySpeechComponent } from './accessibility-speech.component';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-navbar></app-navbar>
    <aside class="accessibility-tools" aria-label="Herramientas de accesibilidad" (keydown.escape)="closeAccessibility($event, accessibilityTrigger)">
      <button
        #accessibilityTrigger
        class="accessibility-trigger"
        type="button"
        aria-label="Accesibilidad"
        aria-controls="accessibility-panel"
        [attr.aria-expanded]="accessibilityOpen"
        (click)="accessibilityOpen = !accessibilityOpen">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"></circle><path d="M4 8l8 2 8-2M12 10v5m-4 6 4-6 4 6"></path></svg>
      </button>
      <section [hidden]="!accessibilityOpen" id="accessibility-panel" class="accessibility-panel" aria-labelledby="accessibility-title">
        <h2 id="accessibility-title">Opciones de accesibilidad</h2>
        <div class="text-size-control">
          <span id="text-size-label">Ampliación de página: {{ fontScale }}%</span>
          <div class="text-size-buttons" role="group" aria-labelledby="text-size-label">
            <button type="button" aria-label="Disminuir ampliación" [disabled]="fontScale <= 100" (click)="changeFontScale(-1)">A−</button>
            <button type="button" aria-label="Aumentar ampliación" [disabled]="fontScale >= 200" (click)="changeFontScale(1)">A+</button>
          </div>
        </div>
        <button class="accessibility-option" type="button" [attr.aria-pressed]="highContrast" (click)="toggleHighContrast()">
          Contraste reforzado: {{ highContrast ? 'activado' : 'desactivado' }}
        </button>
        <button class="accessibility-option" type="button" [attr.aria-pressed]="reducedMotion" (click)="toggleReducedMotion()">
          Reducir movimiento: {{ reducedMotion ? 'activado' : 'desactivado' }}
        </button>
        <button class="accessibility-option" type="button" [attr.aria-pressed]="distinguishStates" (click)="toggleDistinguishStates()">
          Distinguir enlaces y estados: {{ distinguishStates ? 'activado' : 'desactivado' }}
        </button>
        <button class="accessibility-option" type="button" [attr.aria-pressed]="highlightLinks" (click)="toggleHighlightLinks()">
          Resaltar enlaces: {{ highlightLinks ? 'activado' : 'desactivado' }}
        </button>
        <button class="accessibility-option" type="button" [attr.aria-pressed]="textSpacing" (click)="toggleTextSpacing()">
          Espaciado de texto: {{ textSpacing ? 'activado' : 'desactivado' }}
        </button>
        <button class="accessibility-option" type="button" [attr.aria-pressed]="accessibleFont" (click)="toggleAccessibleFont()">
          Fuente sans-serif: {{ accessibleFont ? 'activada' : 'desactivada' }}
        </button>
        <p>Ayuda a distinguir enlaces y estados sin depender solo del color; puede ser útil para personas con daltonismo.</p>
        <app-accessibility-speech></app-accessibility-speech>
        <button class="accessibility-reset" type="button" (click)="resetAccessibility()">Restablecer opciones</button>
        <p *ngIf="storageError" role="alert">{{ storageError }}</p>
        <p>El lector de pantalla y la lupa del dispositivo se activan desde sus propios ajustes.</p>
      </section>
    </aside>
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
    <app-booking *ngIf="bookingOpen" [embedded]="true" [roomId]="bookingRoomId" (closed)="closeBooking()"></app-booking>
    <aside aria-label="Contacto por WhatsApp">
      <app-whatsapp-floating-button></app-whatsapp-floating-button>
    </aside>
  `,
  styles: [`
    .accessibility-tools { position:fixed; bottom:16px; right:16px; z-index:49; }
    .accessibility-trigger,.accessibility-panel button { min-height:44px; border:2px solid var(--forest); border-radius:5px; background:#fff; padding:9px 13px; color:var(--forest); font:inherit; font-weight:700; cursor:pointer; }
    .accessibility-trigger { display:grid; place-items:center; width:56px; height:56px; border-radius:50%; background:var(--forest); color:#fff; box-shadow:0 6px 22px #15291f35; }
    .accessibility-trigger svg { width:30px; height:30px; }
    .accessibility-panel { position:absolute; right:0; bottom:64px; display:grid; gap:12px; width:min(340px,calc(100vw - 32px)); max-height:calc(100dvh - 100px); overflow:auto; border:2px solid var(--forest); border-radius:8px; background:#fff; padding:16px; color:#17221f; box-shadow:0 8px 30px #0003; }
    .accessibility-panel[hidden] { display:none; }
    .accessibility-panel h2 { margin:0; font-size:1.15rem; }
    .accessibility-panel p { margin:0; font-size:.9rem; line-height:1.5; }
    .text-size-control { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .text-size-buttons { display:flex; gap:8px; }
    .accessibility-panel button:disabled { opacity:.55; cursor:not-allowed; }
    .accessibility-panel .accessibility-option,.accessibility-panel .accessibility-reset { width:100%; text-align:left; }
    .accessibility-panel .accessibility-option[aria-pressed="true"] { background:#183b32; color:#fff; }
    .accessibility-panel .accessibility-reset { border-color:#59635d; color:#17221f; }
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
      .accessibility-tools { right:10px; bottom:10px; }
      .footer-content { grid-template-columns:1fr 1fr; }
      .footer-logo { justify-self:end; }
      .footer-contact { grid-column:1/-1; align-items:center; text-align:center; }
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild(AccessibilitySpeechComponent) private speech?: AccessibilitySpeechComponent;
  readonly currentYear = new Date().getFullYear();
  routeAnnouncement = '';
  accessibilityOpen = false;
  fontScale = 100;
  highContrast = false;
  reducedMotion = false;
  distinguishStates = false;
  highlightLinks = false;
  textSpacing = false;
  accessibleFont = false;
  storageError = '';

  bookingOpen = false;
  bookingRoomId: string | null = null;

  constructor(private readonly router: Router, private readonly title: Title, private readonly cdr: ChangeDetectorRef) {}

  closeBooking(): void {
    this.bookingOpen = false;
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    try {
      const savedScale = Number(localStorage.getItem('chaquill-a11y-font-scale'));
      if ([100, 115, 130, 150, 175, 200].includes(savedScale)) this.fontScale = savedScale;
      this.highContrast = localStorage.getItem('chaquill-a11y-high-contrast') === 'true';
      this.reducedMotion = localStorage.getItem('chaquill-a11y-reduced-motion') === 'true';
      this.distinguishStates = localStorage.getItem('chaquill-a11y-distinguish-states') === 'true';
      this.highlightLinks = localStorage.getItem('chaquill-a11y-highlight-links') === 'true';
      this.textSpacing = localStorage.getItem('chaquill-a11y-text-spacing') === 'true';
      this.accessibleFont = localStorage.getItem('chaquill-a11y-accessible-font') === 'true';
    } catch (error) {
      this.reportStorageError(error);
    }
    this.applyAccessibilitySettings();

    // Fase de captura para abrir la reserva como ventana flotante antes de que el routerLink navegue.
    document.addEventListener('click', (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const link = (event.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.origin !== location.origin || link.pathname !== '/reserva' || location.pathname === '/reserva') return;
      event.preventDefault();
      event.stopPropagation();
      this.bookingRoomId = new URLSearchParams(link.search).get('roomId');
      this.bookingOpen = true;
      this.cdr.detectChanges();
    }, true);
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

  closeAccessibility(event: Event, trigger: HTMLButtonElement): void {
    if (!this.accessibilityOpen) return;
    event.stopPropagation();
    this.accessibilityOpen = false;
    trigger.focus();
  }

  changeFontScale(direction: -1 | 1): void {
    const scales = [100, 115, 130, 150, 175, 200];
    const currentIndex = scales.indexOf(this.fontScale);
    this.fontScale = scales[Math.max(0, Math.min(scales.length - 1, currentIndex + direction))];
    this.saveAccessibility();
    this.applyAccessibilitySettings();
  }

  toggleHighContrast(): void {
    this.highContrast = !this.highContrast;
    this.saveAccessibility();
    this.applyAccessibilitySettings();
  }

  toggleReducedMotion(): void {
    this.reducedMotion = !this.reducedMotion;
    this.saveAccessibility();
    this.applyAccessibilitySettings();
  }

  toggleDistinguishStates(): void {
    this.distinguishStates = !this.distinguishStates;
    this.saveAccessibility();
    this.applyAccessibilitySettings();
  }

  toggleHighlightLinks(): void {
    this.highlightLinks = !this.highlightLinks;
    this.saveAccessibility();
    this.applyAccessibilitySettings();
  }

  toggleTextSpacing(): void {
    this.textSpacing = !this.textSpacing;
    this.saveAccessibility();
    this.applyAccessibilitySettings();
  }

  toggleAccessibleFont(): void {
    this.accessibleFont = !this.accessibleFont;
    this.saveAccessibility();
    this.applyAccessibilitySettings();
  }

  resetAccessibility(): void {
    this.fontScale = 100;
    this.highContrast = false;
    this.reducedMotion = false;
    this.distinguishStates = false;
    this.highlightLinks = false;
    this.textSpacing = false;
    this.accessibleFont = false;
    this.speech?.reset();
    this.saveAccessibility();
    this.applyAccessibilitySettings();
  }

  private saveAccessibility(): void {
    try {
      localStorage.setItem('chaquill-a11y-font-scale', String(this.fontScale));
      localStorage.setItem('chaquill-a11y-high-contrast', String(this.highContrast));
      localStorage.setItem('chaquill-a11y-reduced-motion', String(this.reducedMotion));
      localStorage.setItem('chaquill-a11y-distinguish-states', String(this.distinguishStates));
      localStorage.setItem('chaquill-a11y-highlight-links', String(this.highlightLinks));
      localStorage.setItem('chaquill-a11y-text-spacing', String(this.textSpacing));
      localStorage.setItem('chaquill-a11y-accessible-font', String(this.accessibleFont));
      this.storageError = '';
    } catch (error) {
      this.reportStorageError(error);
    }
  }

  private reportStorageError(error: unknown): void {
    console.error('No se pudieron guardar o cargar las preferencias de accesibilidad.', error);
    this.storageError = 'No se pudieron guardar las preferencias en este navegador. Se aplicarán solo durante esta visita.';
  }

  private applyAccessibilitySettings(): void {
    const root = document.documentElement;
    root.classList.toggle('a11y-text-scale-115', this.fontScale === 115);
    root.classList.toggle('a11y-text-scale-130', this.fontScale === 130);
    root.classList.toggle('a11y-text-scale-150', this.fontScale === 150);
    root.classList.toggle('a11y-text-scale-175', this.fontScale === 175);
    root.classList.toggle('a11y-text-scale-200', this.fontScale === 200);
    root.classList.toggle('a11y-high-contrast', this.highContrast);
    root.classList.toggle('a11y-reduced-motion', this.reducedMotion);
    root.classList.toggle('a11y-distinguish-states', this.distinguishStates);
    document.body.classList.toggle('a11y-highlight-links', this.highlightLinks);
    document.body.classList.toggle('a11y-text-spacing', this.textSpacing);
    document.body.classList.toggle('a11y-accessible-font', this.accessibleFont);
  }
}
