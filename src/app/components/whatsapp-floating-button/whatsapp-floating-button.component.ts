import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-whatsapp-floating-button',
  standalone: true,
  template: `
    <a class="whatsapp" [href]="whatsappUrl" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp (abre en una pestaña nueva)" title="WhatsApp">
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.4 7.2L4 20l1.3-4.4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.3-.3.7-.3 1-.1l1 1.3c.2.3.2.6 0 .9l-.6.7a6.4 6.4 0 0 0 2.4 2.4l.7-.6c.3-.2.6-.2.9 0l1.3 1c.2.3.2.7-.1 1-1 1.1-2.2 1.1-3.8.2a9.9 9.9 0 0 1-3-3c-.9-1.6-.9-2.8.2-3.8Z"/></svg>
    </a>
  `,
  styles: [`
    .whatsapp { position:fixed; right:160px; bottom:16px; z-index:30; display:grid; width:56px; height:56px; place-items:center; border:2px solid white; border-radius:50%; background:#146c43; color:#fff; text-decoration:none; box-shadow:0 6px 22px #15291f35; }
    .whatsapp:hover { background:#0e5836; }
    .whatsapp svg { width:27px; height:27px; fill:none; stroke:currentColor; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
    @media(max-width:767px) { .whatsapp { right:78px; bottom:calc(82px + env(safe-area-inset-bottom)); } }
  `]
})
export class WhatsappFloatingButtonComponent {
  readonly whatsappUrl = `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent("Hola, quisiera información sobre una reserva en Chaquill Chak'a Hostal.")}`;
}
