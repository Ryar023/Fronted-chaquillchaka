import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-whatsapp-floating-button',
  standalone: true,
  template: `
    <a class="whatsapp" [href]="whatsappUrl" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp (abre en una pestaña nueva)">
      <span aria-hidden="true">◉</span><span class="whatsapp-label">WhatsApp</span>
    </a>
  `,
  styles: [`
    .whatsapp { position:fixed; right:22px; bottom:22px; z-index:30; display:flex; min-height:50px; align-items:center; gap:9px; border:2px solid white; border-radius:99px; background:#146c43; padding:0 17px; color:#fff; font-size:14px; font-weight:750; text-decoration:none; box-shadow:0 6px 22px #15291f35; }
    .whatsapp:hover { background:#0e5836; }
    .whatsapp span:first-child { font-size:19px; }
    @media(max-width:480px) { .whatsapp{right:14px;bottom:14px;width:52px;height:52px;justify-content:center;padding:0}.whatsapp-label{display:none} }
  `]
})
export class WhatsappFloatingButtonComponent {
  readonly whatsappUrl = `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent("Hola, quisiera información sobre una reserva en Chaquill Chak'a Hostal.")}`;
}
