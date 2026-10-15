import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../models/booking.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-booking-summary-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="dismiss()" (keydown.escape)="dismiss()">
      <section class="modal surface-card" role="dialog" aria-modal="true" aria-labelledby="booking-confirmed-title" (click)="$event.stopPropagation()">
        <button type="button" class="close-button" aria-label="Cerrar resumen y volver al inicio" (click)="dismiss()">×</button>
        <span class="success-icon" aria-hidden="true">✓</span>
        <p class="eyebrow mt-5 mb-2">Comprobante de reserva</p>
        <h2 id="booking-confirmed-title" class="m-0 font-serif text-3xl font-medium text-forest">¡Te esperamos en Cusco!</h2>
        <p class="mt-3 text-sm leading-6 text-stone-600">Tu reserva quedó registrada. El medio seleccionado es solo una preferencia: todavía no se ha cobrado. Confirma el pago directamente con el hostal por WhatsApp o al llegar.</p>
        <dl class="details">
          <div><dt>Código de reserva</dt><dd>{{ booking.id }}</dd></div>
          <div><dt>Huésped</dt><dd>{{ booking.customer.name }}</dd></div>
          <div><dt>Habitación</dt><dd>{{ booking.room.name }}</dd></div>
          <div><dt>Fechas</dt><dd>{{ booking.checkIn | date:'dd/MM/yyyy':'UTC' }} – {{ booking.checkOut | date:'dd/MM/yyyy':'UTC' }}</dd></div>
          <div><dt>Noches · huéspedes</dt><dd>{{ booking.nights }} · {{ booking.guests }}</dd></div>
          <div><dt>Precio por noche</dt><dd>{{ currencySymbol }} {{ pricePerNight | number:'1.2-2' }} {{ booking.paymentCurrency }}</dd></div>
          <div><dt>Medio de pago preferido</dt><dd>{{ paymentMethodLabel }}</dd></div>
          <div class="total"><dt>Total estimado</dt><dd>{{ currencySymbol }} {{ total | number:'1.2-2' }} {{ booking.paymentCurrency }}</dd></div>
        </dl>
        <p *ngIf="printError" class="print-error" role="alert">{{ printError }}</p>
        <button class="primary-button w-full" type="button" (click)="printTicket()">
          Imprimir o guardar como PDF <span aria-hidden="true">↓</span>
        </button>
        <a class="whatsapp-link" [href]="whatsAppLink" target="_blank" rel="noopener noreferrer">
          Contactar por WhatsApp (opcional) <span aria-hidden="true">↗</span>
        </a>
        <button type="button" class="close-link" (click)="dismiss()">Volver al inicio</button>
      </section>
    </div>
  `,
  styles: [`
    .modal-backdrop { position:fixed; inset:0; z-index:60; display:grid; overflow-y:auto; place-items:center; background:#101b16b8; padding:20px; }
    .modal { position:relative; width:min(100%,520px); padding:clamp(24px,5vw,42px); }
    .close-button { position:absolute; top:14px; right:16px; width:44px; height:44px; border:0; background:transparent; color:#47534c; font-size:28px; cursor:pointer; }
    .success-icon { display:grid; width:48px; height:48px; place-items:center; border-radius:50%; background:#e8f2eb; color:#183b32; font-size:24px; font-weight:800; }
    .details { margin:24px 0; border-top:1px solid #e6e8e2; }
    .details div { display:flex; justify-content:space-between; gap:16px; border-bottom:1px solid #e6e8e2; padding:12px 0; font-size:14px; }
    .details dt { color:#59635d; } .details dd { margin:0; text-align:right; font-weight:700; color:#183b32; }
    .details .total dd { font-size:18px; }
    .whatsapp-link { display:block; margin:14px auto 0; color:#146c43; font-size:14px; font-weight:700; text-align:center; text-decoration:underline; text-underline-offset:3px; }
    .print-error { border-radius:4px; background:#fff1f0; padding:10px; color:#8c2b21; font-size:13px; }
    .close-link { display:block; margin:14px auto 0; border:0; background:none; padding:6px; color:#44534b; font-weight:650; text-decoration:underline; text-underline-offset:3px; cursor:pointer; }
  `]
})
export class BookingSummaryModalComponent {
  @Input({ required: true }) booking!: Booking;
  @Output() closed = new EventEmitter<void>();
  printError = '';

  get whatsAppLink(): string {
    return `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(this.message)}`;
  }

  get message(): string {
    const date = (value: string): string => new Date(value).toLocaleDateString('es-PE', { timeZone: 'UTC' });
    return `Hola, registré una reserva en Chaquill Chak'a Hostal y quisiera coordinar los detalles.\n` +
      `Código: ${this.booking.id}\nHabitación: ${this.booking.room.name}\n` +
      `Llegada: ${date(this.booking.checkIn)}\nSalida: ${date(this.booking.checkOut)}\n` +
      `Huéspedes: ${this.booking.guests}\nNoches: ${this.booking.nights}\n` +
      `Total estimado: ${this.currencySymbol} ${this.total.toFixed(2)} ${this.booking.paymentCurrency}\n` +
      `Medio de pago preferido: ${this.paymentMethodLabel} (pendiente de coordinación).`;
  }

  get currencySymbol(): string {
    return this.booking.paymentCurrency === 'USD' ? '$' : 'S/';
  }

  get pricePerNight(): number {
    return this.booking.paymentCurrency === 'USD' ? this.booking.pricePerNightUsd : this.booking.pricePerNightPen;
  }

  get total(): number {
    return this.booking.paymentCurrency === 'USD' ? this.booking.totalUsd : this.booking.totalPen;
  }

  get paymentMethodLabel(): string {
    const labels: Record<Booking['paymentMethod'], string> = {
      yape: 'Yape',
      plin: 'Plin',
      card: 'Tarjeta',
      cash: 'Efectivo'
    };
    return labels[this.booking.paymentMethod];
  }

  printTicket(): void {
    const ticketWindow = window.open('', '_blank', 'popup,width=720,height=820');
    if (!ticketWindow) {
      this.printError = 'El navegador bloqueó la ventana del comprobante. Permite las ventanas emergentes para imprimir o guardar el PDF.';
      return;
    }

    this.printError = '';
    const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return entities[character] ?? character;
    });
    const safe = {
      id: escapeHtml(this.booking.id),
      name: escapeHtml(this.booking.customer.name),
      email: escapeHtml(this.booking.customer.email),
      phone: escapeHtml(this.booking.customer.phone),
      room: escapeHtml(this.booking.room.name),
      checkIn: escapeHtml(this.formatDate(this.booking.checkIn)),
      checkOut: escapeHtml(this.formatDate(this.booking.checkOut)),
      guests: String(this.booking.guests),
      nights: String(this.booking.nights),
      rate: this.formatPrice(this.pricePerNight),
      total: this.formatPrice(this.total),
      currency: this.booking.paymentCurrency,
      currencySymbol: this.currencySymbol,
      paymentMethod: this.paymentMethodLabel
    };

    ticketWindow.document.open();
    ticketWindow.document.write(`<!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Comprobante ${safe.id} | Chaquill Chak'a</title>
          <style>
            *{box-sizing:border-box}body{margin:0;background:#f3f2ed;padding:32px;color:#17221f;font:15px/1.5 Arial,sans-serif}
            main{width:min(100%,680px);margin:auto;border:1px solid #dce1da;border-radius:8px;background:#fff;padding:38px}
            .brand{color:#183b32;font:700 15px Arial,sans-serif;letter-spacing:2px}.eyebrow{margin:32px 0 6px;color:#a84e2c;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase}
            h1{margin:0;color:#183b32;font:500 34px Georgia,serif}.intro{color:#59635d}.code{margin:22px 0;border-radius:4px;background:#edf2ed;padding:14px;color:#183b32;font-weight:bold;overflow-wrap:anywhere}
            dl{margin:22px 0;border-top:1px solid #e3e6df}dl div{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #e3e6df;padding:13px 0}
            dt{color:#59635d}dd{margin:0;text-align:right;font-weight:bold}.total dd{color:#183b32;font-size:20px}.note{margin-top:22px;color:#59635d;font-size:12px}
            button{display:block;margin:24px auto 0;border:0;border-radius:4px;background:#183b32;padding:13px 22px;color:#fff;font-size:14px;font-weight:bold}
            @media print{body{background:#fff;padding:0}main{width:100%;border:0;border-radius:0;padding:20px}button{display:none}}
          </style>
        </head>
        <body>
          <main>
            <div class="brand">CHAQUILL CHAK'A · CUSCO</div>
            <p class="eyebrow">Comprobante de reserva</p>
            <h1>¡Te esperamos!</h1>
            <p class="intro">Tu reserva quedó registrada en Chaquill Chak'a Hostal.</p>
            <p class="code">Código de reserva: ${safe.id}</p>
            <dl>
              <div><dt>Huésped</dt><dd>${safe.name}</dd></div>
              <div><dt>Habitación</dt><dd>${safe.room}</dd></div>
              <div><dt>Llegada</dt><dd>${safe.checkIn}</dd></div>
              <div><dt>Salida</dt><dd>${safe.checkOut}</dd></div>
              <div><dt>Noches</dt><dd>${safe.nights}</dd></div>
              <div><dt>Huéspedes</dt><dd>${safe.guests}</dd></div>
              <div><dt>Precio por noche</dt><dd>${safe.currencySymbol} ${safe.rate} ${safe.currency}</dd></div>
              <div><dt>Medio de pago preferido</dt><dd>${safe.paymentMethod}</dd></div>
              <div class="total"><dt>Total estimado</dt><dd>${safe.currencySymbol} ${safe.total} ${safe.currency}</dd></div>
              <div><dt>Correo de contacto</dt><dd>${safe.email}</dd></div>
              <div><dt>Teléfono</dt><dd>${safe.phone}</dd></div>
            </dl>
            <p class="note">El medio de pago es una preferencia; este comprobante no confirma que se haya realizado un cobro. Coordina el pago con el hostal. Calle Belén N.° 418, Cusco.</p>
            <button type="button" onclick="window.print()">Imprimir / Guardar como PDF</button>
          </main>
        </body>
      </html>`);
    ticketWindow.document.close();
    ticketWindow.focus();
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString('es-PE', { timeZone: 'UTC' });
  }

  private formatPrice(value: number): string {
    return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  dismiss(): void {
    this.closed.emit();
  }
}
