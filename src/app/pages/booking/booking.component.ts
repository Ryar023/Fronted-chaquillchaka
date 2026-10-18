import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingSummaryModalComponent } from '../../components/booking-summary-modal/booking-summary-modal.component';
import { Booking } from '../../models/booking.interface';
import { Room, RoomOccupancy } from '../../models/room.interface';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BookingSummaryModalComponent],
  template: `
    <section class="page-banner">
      <div class="page-shell py-14 sm:py-20">
        <p class="eyebrow">Reserva directa · Sin intermediarios</p>
        <h1 class="section-title">Haz una reservación</h1>
        <p class="max-w-2xl leading-7 text-stone-600">Cuéntanos cuándo vienes. Revisaremos la disponibilidad y te mostraremos el resumen de tu estancia.</p>
      </div>
    </section>
    <section class="page-shell booking-layout">
      <div class="booking-card surface-card">
        <div class="mb-7 border-b border-stone-200 pb-5">
          <p class="eyebrow">Tus datos de viaje</p>
          <h2 class="m-0 mt-2 font-serif text-2xl font-medium text-forest">Completa tu solicitud</h2>
        </div>
        <div *ngIf="loadingRooms" class="mb-5 rounded bg-stone-50 p-4 text-sm text-stone-700" role="status" aria-live="polite">
          Cargando habitaciones disponibles…
        </div>
        <div *ngIf="roomsError" class="mb-5 rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900" role="alert">
          <p class="m-0">{{ roomsError }}</p>
          <button class="mt-2 font-semibold underline" type="button" (click)="loadRooms(true)">Volver a cargar</button>
        </div>
        <p *ngIf="roomsWarning" class="mb-5 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status">
          {{ roomsWarning }} Puedes continuar; el servidor comprobará la habitación y el precio al confirmar.
        </p>
        <form [formGroup]="bookingForm" (ngSubmit)="submit()" novalidate>
          <div class="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label class="field sm:col-span-2" for="booking-name">
              <span>Nombre completo <span aria-hidden="true">*</span></span>
              <input id="booking-name" class="form-control" type="text" formControlName="name" autocomplete="name" placeholder="Como aparece en tu documento" [attr.aria-invalid]="showError('name')" aria-describedby="name-error" aria-required="true">
              <small *ngIf="showError('name')" id="name-error" class="field-error">Ingresa tu nombre completo (al menos 2 caracteres).</small>
            </label>
            <label class="field" for="booking-email">
              <span>Correo electrónico <span aria-hidden="true">*</span></span>
              <input id="booking-email" class="form-control" type="email" formControlName="email" autocomplete="email" placeholder="tu@correo.com" [attr.aria-invalid]="showError('email')" aria-describedby="email-error" aria-required="true">
              <small *ngIf="showError('email')" id="email-error" class="field-error">Ingresa un correo electrónico válido.</small>
            </label>
            <label class="field" for="booking-phone">
              <span>Teléfono / WhatsApp <span aria-hidden="true">*</span></span>
              <input id="booking-phone" class="form-control" type="tel" formControlName="phone" autocomplete="tel" placeholder="+51 987 654 321" [attr.aria-invalid]="showError('phone')" aria-describedby="phone-error" aria-required="true">
              <small *ngIf="showError('phone')" id="phone-error" class="field-error">Ingresa un teléfono válido.</small>
            </label>
            <label class="field sm:col-span-2" for="booking-room">
              <span>Habitación <span aria-hidden="true">*</span></span>
              <select id="booking-room" class="form-control" formControlName="roomId" [disabled]="loadingRooms || !!roomsError || rooms.length === 0" [attr.aria-invalid]="showError('roomId')" aria-describedby="room-error" aria-required="true">
                <option value="">{{ loadingRooms ? 'Cargando habitaciones…' : roomsError ? 'No se pudieron cargar las habitaciones' : rooms.length ? 'Selecciona una habitación' : 'No hay habitaciones disponibles' }}</option>
                <option *ngFor="let room of rooms" [value]="room._id">{{ room.name }} · S/ {{ room.pricePen }} por noche · {{ room.capacity }} huésped(es)</option>
              </select>
              <small *ngIf="showError('roomId')" id="room-error" class="field-error">Selecciona una habitación disponible.</small>
            </label>
            <section *ngIf="selectedRoom" class="occupied-box sm:col-span-2" aria-live="polite" aria-label="Fechas ya reservadas">
              <p class="occupied-title">{{ selectedOccupancy.length ? 'Fechas ya reservadas en esta habitación (elige fechas distintas):' : 'Esta habitación no tiene reservas próximas registradas.' }}</p>
              <ul *ngIf="selectedOccupancy.length">
                <li *ngFor="let range of selectedOccupancy">Ocupada del {{ range.checkIn | date:'dd/MM/yyyy':'UTC' }} al {{ range.checkOut | date:'dd/MM/yyyy':'UTC' }}</li>
              </ul>
            </section>
            <label class="field" for="booking-checkin">
              <span>Fecha de llegada <span aria-hidden="true">*</span></span>
              <input id="booking-checkin" class="form-control" type="date" formControlName="checkIn" [min]="today" (change)="onCheckInChange()" [attr.aria-invalid]="showError('checkIn') || hasPastCheckInError" aria-describedby="checkin-error" aria-required="true">
              <small *ngIf="showError('checkIn') || hasPastCheckInError" id="checkin-error" class="field-error">{{ hasPastCheckInError ? 'La llegada no puede estar en el pasado.' : 'Elige una fecha de llegada válida desde hoy.' }}</small>
            </label>
            <label class="field" for="booking-checkout">
              <span>Fecha de salida <span aria-hidden="true">*</span></span>
              <input id="booking-checkout" class="form-control" type="date" formControlName="checkOut" [min]="checkOutMinimum" (change)="bookingForm.updateValueAndValidity()" [attr.aria-invalid]="showError('checkOut') || hasDateOrderError" aria-describedby="checkout-error" aria-required="true">
              <small *ngIf="showError('checkOut') && !hasDateOrderError" id="checkout-error" class="field-error">Elige una fecha de salida.</small>
              <small *ngIf="hasDateOrderError" id="checkout-error" class="field-error">La salida debe ser posterior a la llegada.</small>
            </label>
            <label class="field" for="booking-guests">
              <span>Número de huéspedes <span aria-hidden="true">*</span></span>
              <input id="booking-guests" class="form-control" type="number" formControlName="guests" min="1" [max]="selectedRoom?.capacity || 20" step="1" [attr.aria-invalid]="showError('guests')" aria-describedby="guests-error" aria-required="true">
              <small *ngIf="showError('guests')" id="guests-error" class="field-error">{{ selectedRoom ? 'Esta habitación admite hasta ' + selectedRoom.capacity + ' huéspedes.' : 'Ingresa al menos 1 huésped.' }}</small>
            </label>
            <fieldset class="payment-options sm:col-span-2">
              <legend>¿Cómo prefieres pagar?</legend>
              <p>Esta selección es una solicitud para coordinar el pago; todavía no se realiza ningún cobro en línea.</p>
              <div class="payment-choice-grid">
                <label><input type="radio" formControlName="paymentMethod" value="yape"><span aria-hidden="true">Y</span> Yape <small>Soles</small></label>
                <label><input type="radio" formControlName="paymentMethod" value="plin"><span aria-hidden="true">P</span> Plin <small>Soles</small></label>
                <label><input type="radio" formControlName="paymentMethod" value="card"><span aria-hidden="true">▣</span> Tarjeta</label>
                <label><input type="radio" formControlName="paymentMethod" value="cash"><span aria-hidden="true">S/</span> Efectivo</label>
              </div>
              <label *ngIf="bookingForm.controls.paymentMethod.value === 'card' || bookingForm.controls.paymentMethod.value === 'cash'" class="field payment-currency">
                Moneda preferida
                <select class="form-control" formControlName="paymentCurrency">
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </label>
              <div *ngIf="paymentMethod === 'yape' || paymentMethod === 'plin'" class="pay-panel" aria-live="polite">
                <img *ngIf="qrDataUrl" class="pay-qr" [src]="qrDataUrl" [alt]="'Código QR de demostración para pagar con ' + (paymentMethod === 'yape' ? 'Yape' : 'Plin')" width="170" height="170">
                <div>
                  <p class="pay-title">Paga con {{ paymentMethod === 'yape' ? 'Yape' : 'Plin' }} (solo soles) <span class="demo-tag">Demostración</span></p>
                  <ol>
                    <li>Escanea el QR o envía al número <strong>{{ yapePlinNumber }}</strong> a nombre de <strong>{{ yapePlinHolder }}</strong>.</li>
                    <li>Monto a pagar: <strong>{{ estimateTotal !== null ? 'S/ ' + (estimateTotal | number:'1.2-2') : 'completa las fechas para ver el monto' }}</strong>.</li>
                    <li>Envía la captura por WhatsApp con tu código de reserva para que recepción confirme tu pago.</li>
                  </ol>
                </div>
              </div>
              <div *ngIf="paymentMethod === 'card'" class="pay-panel card-panel" aria-live="polite">
                <div class="card-form">
                  <p class="pay-title">Datos de la tarjeta <span class="demo-tag">Simulación</span></p>
                  <p class="demo-note">Proyecto académico: usa datos ficticios, por ejemplo 4111 1111 1111 1111. Estos datos no se envían ni se guardan.</p>
                  <label class="field" for="card-number"><span>Número de tarjeta</span>
                    <input id="card-number" class="form-control" type="text" inputmode="numeric" autocomplete="off" maxlength="19" placeholder="4111 1111 1111 1111" formControlName="cardNumber" (input)="formatCardNumber()" [attr.aria-invalid]="showError('cardNumber')" aria-describedby="card-number-error" aria-required="true">
                    <small *ngIf="showError('cardNumber')" id="card-number-error" class="field-error">Error: ingresa los 16 dígitos de la tarjeta.</small>
                  </label>
                  <label class="field" for="card-name"><span>Nombre del titular</span>
                    <input id="card-name" class="form-control" type="text" autocomplete="off" placeholder="Como figura en la tarjeta" formControlName="cardName" [attr.aria-invalid]="showError('cardName')" aria-describedby="card-name-error" aria-required="true">
                    <small *ngIf="showError('cardName')" id="card-name-error" class="field-error">Error: ingresa el nombre del titular.</small>
                  </label>
                  <div class="card-row">
                    <label class="field" for="card-expiry"><span>Vence (MM/AA)</span>
                      <input id="card-expiry" class="form-control" type="text" inputmode="numeric" autocomplete="off" maxlength="5" placeholder="12/28" formControlName="cardExpiry" (input)="formatExpiry()" [attr.aria-invalid]="showError('cardExpiry')" aria-describedby="card-expiry-error" aria-required="true">
                      <small *ngIf="showError('cardExpiry')" id="card-expiry-error" class="field-error">Error: usa el formato MM/AA.</small>
                    </label>
                    <label class="field" for="card-cvv"><span>CVV</span>
                      <input id="card-cvv" class="form-control" type="password" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="123" formControlName="cardCvv" [attr.aria-invalid]="showError('cardCvv')" aria-describedby="card-cvv-error" aria-required="true">
                      <small *ngIf="showError('cardCvv')" id="card-cvv-error" class="field-error">Error: ingresa 3 o 4 dígitos.</small>
                    </label>
                  </div>
                </div>
              </div>
              <div *ngIf="paymentMethod === 'cash'" class="pay-panel" aria-live="polite">
                <div>
                  <p class="pay-title">Pago en efectivo</p>
                  <p class="m-0">Pagas directamente en recepción al llegar, en soles o dólares.</p>
                </div>
              </div>
              <small class="payment-note">Esta web es un proyecto académico: los códigos QR y el formulario de tarjeta son una simulación y no realizan cobros reales.</small>            </fieldset>
            <fieldset class="payment-options sm:col-span-2">
              <legend>Tipo de comprobante</legend>
              <p>Elige el documento que necesitas por tu estancia.</p>
              <div class="payment-choice-grid doc-grid">
                <label><input type="radio" formControlName="documentType" value="boleta"><span aria-hidden="true">B</span> Boleta <small>Persona natural</small></label>
                <label><input type="radio" formControlName="documentType" value="factura"><span aria-hidden="true">F</span> Factura <small>Con RUC</small></label>
              </div>
              <div *ngIf="bookingForm.controls.documentType.value === 'factura'" class="invoice-fields" aria-live="polite">
                <label class="field" for="booking-ruc">
                  <span>RUC <span aria-hidden="true">*</span></span>
                  <input id="booking-ruc" class="form-control" type="text" inputmode="numeric" maxlength="11" formControlName="ruc" autocomplete="off" placeholder="11 dígitos" [attr.aria-invalid]="showError('ruc')" aria-describedby="ruc-error" aria-required="true">
                  <small *ngIf="showError('ruc')" id="ruc-error" class="field-error">Error: ingresa un RUC válido de 11 dígitos que empiece con 10 o 20.</small>
                </label>
                <label class="field" for="booking-business">
                  <span>Razón social <span aria-hidden="true">*</span></span>
                  <input id="booking-business" class="form-control" type="text" formControlName="businessName" autocomplete="organization" [attr.aria-invalid]="showError('businessName')" aria-describedby="business-error" aria-required="true">
                  <small *ngIf="showError('businessName')" id="business-error" class="field-error">Error: ingresa la razón social de la empresa.</small>
                </label>
                <label class="field invoice-wide" for="booking-fiscal">
                  <span>Dirección fiscal <span aria-hidden="true">*</span></span>
                  <input id="booking-fiscal" class="form-control" type="text" formControlName="fiscalAddress" autocomplete="street-address" [attr.aria-invalid]="showError('fiscalAddress')" aria-describedby="fiscal-error" aria-required="true">
                  <small *ngIf="showError('fiscalAddress')" id="fiscal-error" class="field-error">Error: ingresa la dirección fiscal.</small>
                </label>
              </div>
            </fieldset>
          </div>
          <section *ngIf="selectedRoom" class="estimate-card mt-6" aria-live="polite" aria-label="Estimado de la estancia">
            <div class="estimate-heading">
              <span class="estimate-icon" aria-hidden="true">✓</span>
              <div>
                <p class="m-0 font-semibold text-forest">{{ selectedRoom.name }}</p>
                <p class="m-0 mt-1 text-xs text-stone-600">Tu estancia estimada</p>
              </div>
            </div>
            <div class="estimate-line">
              <span>{{ estimatedNights }} {{ estimatedNights === 1 ? 'noche' : 'noches' }} × {{ bookingForm.controls.paymentCurrency.value === 'USD' ? '$' + (selectedRoom.priceUsd | number:'1.2-2') + ' USD' : 'S/ ' + (selectedRoom.pricePen | number:'1.2-2') }}</span>
              <strong>{{ bookingForm.controls.paymentCurrency.value === 'USD' ? (estimateTotalUsd !== null ? ('$' + (estimateTotalUsd | number:'1.2-2') + ' USD') : 'Completa las fechas') : (estimateTotal !== null ? ('S/ ' + (estimateTotal | number:'1.2-2')) : 'Completa las fechas') }}</strong>
            </div>
            <p class="estimate-note">Estimado informativo. Precio y disponibilidad se confirman al enviar la solicitud.</p>
          </section>
          <p class="mt-6 rounded bg-stone-50 p-4 text-xs leading-5 text-stone-600">El servidor vuelve a comprobar la disponibilidad antes de registrar tu reserva. La selección de pago es una preferencia, no un cobro en línea. Después podrás imprimir o guardar tu comprobante; escribirnos por WhatsApp es opcional.</p>
          <p *ngIf="serverError" class="mt-4 rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900" role="alert" aria-live="assertive">{{ serverError }}</p>
          <button class="primary-button mt-5 w-full" type="submit" [disabled]="submitting || loadingRooms || rooms.length === 0">
            {{ submitting ? 'Verificando disponibilidad…' : 'Confirmar Reserva' }}
          </button>
        </form>
      </div>
      <aside class="booking-aside">
        <div class="aside-photo" role="img" aria-label="Habitación cómoda del hostal"></div>
        <h2 class="mt-6 font-serif text-2xl font-medium text-forest">Una estancia a tu ritmo</h2>
        <p class="leading-7 text-stone-600">Estamos en el centro histórico de Cusco, con Wi-Fi, baño privado y atención cercana para acompañar tu viaje.</p>
        <a routerLink="/ubicacion" class="text-link">Ver cómo llegar →</a>
      </aside>
    </section>
    <app-booking-summary-modal *ngIf="confirmedBooking" [booking]="confirmedBooking" (closed)="closeConfirmation()"></app-booking-summary-modal>
  `,
  styles: [`
    .page-banner{background:#f2f1eb}.booking-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(250px,.65fr);gap:clamp(28px,7vw,90px);align-items:start;padding-block:54px 90px}
    .booking-card{padding:clamp(21px,4vw,42px)}.field{display:flex;flex-direction:column;gap:8px;color:#26362e;font-size:13px;font-weight:700}
    .field>span>span{color:#a12e21}.field-error{font-weight:500}.booking-aside{padding-top:7px}.aside-photo{height:215px;border-radius:6px;background-color:#ded8cb;background-image:url('/assets/images/slide_habitacion.jpg');background-position:center;background-size:cover}
    .estimate-card{border:1px solid #dfe5dc;border-radius:6px;background:#f8faf7;padding:16px}.estimate-heading{display:flex;align-items:center;gap:11px}.estimate-icon{display:grid;width:30px;height:30px;place-items:center;border-radius:50%;background:#e5efe7;color:#183b32;font-weight:800}.estimate-line{display:flex;justify-content:space-between;gap:14px;margin-top:16px;border-top:1px solid #e1e6de;padding-top:13px;font-size:13px;color:#455149}.estimate-line strong{color:#183b32}.estimate-note{margin:10px 0 0;color:#606b63;font-size:11px;line-height:1.5}
    .payment-options{min-width:0;margin:0;border:0;padding:0}.payment-options legend{color:#26362e;font-size:13px;font-weight:700}.payment-options>p{margin:6px 0 12px;color:#59635d;font-size:12px;line-height:1.5}.payment-choice-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.payment-choice-grid label{position:relative;display:flex;min-height:54px;align-items:center;gap:7px;border:1px solid #d8ded7;border-radius:5px;background:#fff;padding:9px;color:#26362e;font-size:12px;cursor:pointer}.payment-choice-grid input{accent-color:#183b32}.payment-choice-grid label>span{display:grid;width:25px;height:25px;flex:none;place-items:center;border-radius:50%;background:#edf3ed;color:#183b32;font-size:11px;font-weight:800}.payment-choice-grid label small{margin-left:auto;color:#657168;font-size:10px}.payment-currency{max-width:260px;margin-top:13px}.payment-note{display:block;margin-top:10px;color:#606b63;font-size:11px;line-height:1.5}
    @media(max-width:760px){.booking-layout{grid-template-columns:1fr;padding-block:30px 65px}.booking-aside{order:-1}.aside-photo{height:190px}}
    @media(max-width:520px){.payment-choice-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    .pay-panel{display:flex;gap:16px;align-items:center;margin-top:14px;border:1px solid #cfe0d3;border-radius:8px;background:#f1f7f2;padding:14px;color:#26362e;font-size:14px;line-height:1.5}.pay-qr{border:1px solid #d8ded7;border-radius:6px;background:#fff;padding:6px}.pay-title{margin:0 0 6px;font-weight:700;color:#183b32}.pay-panel ol{margin:0;padding-left:18px}.demo-tag{display:inline-block;margin-left:6px;border-radius:999px;background:#fff3d6;color:#6b4a00;padding:2px 8px;font-size:11px;font-weight:700}.demo-note{margin:0 0 10px;color:#46544d;font-size:12px}.card-panel{display:block}.card-form{display:grid;gap:12px;max-width:420px}.card-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .occupied-box{border:1px solid #e7c9a4;border-radius:6px;background:#fdf3e7;padding:10px 14px;color:#5a3512;font-size:13px}.occupied-box p{margin:0;font-weight:700}.occupied-box ul{margin:6px 0 0;padding-left:18px}
    .doc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.invoice-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:16px}.invoice-wide{grid-column:1/-1}@media(max-width:520px){.invoice-fields{grid-template-columns:1fr}}
  `]
})
export class BookingComponent implements OnInit {
  rooms: Room[] = [];
  loadingRooms = true;
  submitting = false;
  roomsError = '';
  roomsWarning = '';
  serverError = '';
  confirmedBooking: Booking | null = null;
  private requestedRoomId: string | null = null;
  readonly today = this.toLocalIsoDate(new Date());
  checkOutMinimum = this.today;

  private readonly dateOrderValidator = (control: AbstractControl): ValidationErrors | null => {
    const checkIn = control.get('checkIn')?.value as string | null;
    const checkOut = control.get('checkOut')?.value as string | null;
    if (!checkIn || checkIn < this.today) return checkIn ? { checkInPast: true } : null;
    if (!checkOut) return null;
    return checkOut > checkIn ? null : { dateOrder: true };
  };

  readonly bookingForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+()\d\s.-]{7,20}$/)]],
    roomId: ['', Validators.required],
    checkIn: [this.today, Validators.required],
    checkOut: ['', Validators.required],
    guests: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    paymentMethod: this.formBuilder.nonNullable.control<'yape' | 'plin' | 'card' | 'cash'>('cash', Validators.required),
    paymentCurrency: this.formBuilder.nonNullable.control<'PEN' | 'USD'>('PEN', Validators.required),
    cardNumber: [''],
    cardName: [''],
    cardExpiry: [''],
    cardCvv: [''],
    documentType: this.formBuilder.nonNullable.control<'boleta' | 'factura'>('boleta'),
    ruc: [''],
    businessName: [''],
    fiscalAddress: ['']
  }, { validators: this.dateOrderValidator });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly roomService: RoomService,
    private readonly bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.rooms = this.roomService.getCachedRooms();
    this.loadingRooms = this.rooms.length === 0;
    this.bookingForm.controls.checkIn.valueChanges.subscribe((checkIn) => {
      this.checkOutMinimum = checkIn && checkIn >= this.today ? this.nextDate(checkIn) : this.today;
      this.bookingForm.updateValueAndValidity({ emitEvent: false });
    });
    this.bookingForm.controls.roomId.valueChanges.subscribe((roomId) => {
      const room = this.rooms.find((item) => item._id === roomId) ?? null;
      const guests = this.bookingForm.controls.guests;
      guests.setValidators([Validators.required, Validators.min(1), Validators.max(room?.capacity ?? 20)]);
      if (room && Number(guests.value) > room.capacity) guests.setValue(room.capacity);
      guests.updateValueAndValidity();
    });
    this.bookingForm.controls.paymentMethod.valueChanges.subscribe((method) => {
      this.applyCardValidators(method === 'card');
      this.refreshQr();
      if (method === 'yape' || method === 'plin') {
        this.bookingForm.controls.paymentCurrency.setValue('PEN');
      }
    });
    this.bookingForm.controls.documentType.valueChanges.subscribe((type) => {
      const { ruc, businessName, fiscalAddress } = this.bookingForm.controls;
      const invoice = type === 'factura';
      ruc.setValidators(invoice ? [Validators.required, Validators.pattern(/^(10|20)\d{9}$/)] : []);
      businessName.setValidators(invoice ? [Validators.required, Validators.minLength(3), Validators.maxLength(150)] : []);
      fiscalAddress.setValidators(invoice ? [Validators.required, Validators.minLength(5), Validators.maxLength(200)] : []);
      [ruc, businessName, fiscalAddress].forEach((control) => {
        if (!invoice) control.setValue('');
        control.updateValueAndValidity();
      });
    });
    this.route.queryParamMap.subscribe((queryParams) => {
      this.requestedRoomId = queryParams.get('roomId');
      if (!this.loadingRooms) this.applyRequestedRoom();
    });
    this.bookingForm.valueChanges.subscribe(() => this.refreshQr());
    this.loadRooms();
    this.roomService.refreshOccupancy().subscribe((items) => this.occupancy = items);
  }

  loadRooms(refresh = false): void {
    this.loadingRooms = this.rooms.length === 0;
    this.roomsError = '';
    this.roomsWarning = '';
    const roomsRequest = refresh ? this.roomService.refreshRooms() : this.roomService.getRooms();
    roomsRequest.subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loadingRooms = false;
        this.applyRequestedRoom();
      },
      error: () => {
        this.loadingRooms = false;
        if (this.rooms.length > 0) {
          this.roomsWarning = 'No pudimos actualizar el catálogo guardado en este navegador.';
        } else {
          this.roomsError = 'No fue posible consultar las habitaciones. Comprueba tu conexión e inténtalo de nuevo.';
        }
      }
    });
  }

  private applyRequestedRoom(): void {
    const roomId = this.requestedRoomId;
    const selectedId = roomId && this.rooms.some((room) => room._id === roomId) ? roomId : '';
    if (this.bookingForm.controls.roomId.value !== selectedId) {
      this.bookingForm.controls.roomId.setValue(selectedId);
    }
  }

  occupancy: RoomOccupancy[] = [];
  qrDataUrl = '';
  private lastQrPayload = '';
  readonly yapePlinNumber = environment.yapePlinNumber;
  readonly yapePlinHolder = environment.yapePlinHolder;

  formatCardNumber(): void {
    const control = this.bookingForm.controls.cardNumber;
    const digits = (control.value ?? '').replace(/\D/g, '').slice(0, 16);
    control.setValue(digits.replace(/(\d{4})(?=\d)/g, '$1 '), { emitEvent: false });
  }

  formatExpiry(): void {
    const control = this.bookingForm.controls.cardExpiry;
    const digits = (control.value ?? '').replace(/\D/g, '').slice(0, 4);
    control.setValue(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits, { emitEvent: false });
  }

  private applyCardValidators(enabled: boolean): void {
    const { cardNumber, cardName, cardExpiry, cardCvv } = this.bookingForm.controls;
    cardNumber.setValidators(enabled ? [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)] : []);
    cardName.setValidators(enabled ? [Validators.required, Validators.minLength(3)] : []);
    cardExpiry.setValidators(enabled ? [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)] : []);
    cardCvv.setValidators(enabled ? [Validators.required, Validators.pattern(/^\d{3,4}$/)] : []);
    [cardNumber, cardName, cardExpiry, cardCvv].forEach((control) => {
      if (!enabled) control.setValue('', { emitEvent: false });
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private refreshQr(): void {
    const method = this.paymentMethod;
    if (method !== 'yape' && method !== 'plin') { this.qrDataUrl = ''; this.lastQrPayload = ''; return; }
    const payload = `DEMO-${method.toUpperCase()}|${this.yapePlinNumber}|${this.yapePlinHolder}|PEN ${(this.estimateTotal ?? 0).toFixed(2)}|SIMULACION ACADEMICA`;
    if (payload === this.lastQrPayload) return;
    this.lastQrPayload = payload;
    void import('qrcode').then((QRCode) => QRCode.toDataURL(payload, { width: 170, margin: 1, color: { dark: '#183b32', light: '#ffffff' } }))
      .then((url) => { if (payload === this.lastQrPayload) this.qrDataUrl = url; });
  }

  get paymentMethod(): 'yape' | 'plin' | 'card' | 'cash' {
    return this.bookingForm.controls.paymentMethod.value;
  }

  get selectedOccupancy(): RoomOccupancy[] {
    const id = this.bookingForm.controls.roomId.value;
    return this.occupancy.filter((item) => item.roomId === id);
  }

  get selectedRoom(): Room | null {
    return this.rooms.find((room) => room._id === this.bookingForm.controls.roomId.value) ?? null;
  }

  get hasDateOrderError(): boolean {
    return this.bookingForm.hasError('dateOrder') &&
      (this.bookingForm.controls.checkIn.touched || this.bookingForm.controls.checkOut.touched);
  }

  get hasPastCheckInError(): boolean {
    return this.bookingForm.hasError('checkInPast') && this.bookingForm.controls.checkIn.touched;
  }

  get estimatedNights(): number {
    const checkIn = this.bookingForm.controls.checkIn.value;
    const checkOut = this.bookingForm.controls.checkOut.value;
    if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
    return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000);
  }

  get estimateTotal(): number | null {
    const room = this.selectedRoom;
    return room && this.estimatedNights > 0 ? room.pricePen * this.estimatedNights : null;
  }

  get estimateTotalUsd(): number | null {
    const room = this.selectedRoom;
    return room && this.estimatedNights > 0 ? room.priceUsd * this.estimatedNights : null;
  }

  showError(controlName: keyof typeof this.bookingForm.controls): boolean {
    const control = this.bookingForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  onCheckInChange(): void {
    const checkIn = this.bookingForm.controls.checkIn.value;
    this.checkOutMinimum = checkIn && checkIn >= this.today ? this.nextDate(checkIn) : this.today;
    this.bookingForm.updateValueAndValidity();
  }

  submit(): void {
    this.serverError = '';
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    const { name, email, phone, roomId, checkIn, checkOut, guests, paymentMethod, paymentCurrency, documentType, ruc, businessName, fiscalAddress } = this.bookingForm.getRawValue();
    if (!name || !email || !phone || !roomId || !checkIn || !checkOut || guests === null || !paymentMethod || !paymentCurrency) return;

    this.submitting = true;
    this.bookingService.createBooking({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roomId,
      checkIn,
      checkOut,
      guests: Number(guests),
      paymentMethod,
      paymentCurrency,
      documentType,
      ...(documentType === 'factura' ? { ruc: (ruc ?? '').trim(), businessName: (businessName ?? '').trim(), fiscalAddress: (fiscalAddress ?? '').trim() } : {})
    }).subscribe({
      next: (booking) => {
        this.confirmedBooking = booking;
        this.roomService.refreshOccupancy().subscribe((items) => this.occupancy = items);
        this.bookingForm.reset({
          name: '',
          email: '',
          phone: '',
          roomId: '',
          checkIn: this.today,
          checkOut: '',
          guests: 1,
          paymentMethod: 'cash',
          paymentCurrency: 'PEN',
          documentType: 'boleta',
          ruc: '',
          businessName: '',
          fiscalAddress: ''
        });
        this.checkOutMinimum = this.today;
        this.submitting = false;
      },
      error: (error: HttpErrorResponse) => {
        this.serverError = typeof error.error?.message === 'string'
          ? error.error.message
          : 'No pudimos registrar la reserva. Revisa tu conexión e inténtalo nuevamente.';
        this.submitting = false;
      }
    });
  }

  closeConfirmation(): void {
    this.confirmedBooking = null;
    void this.router.navigateByUrl('/inicio');
  }

  private nextDate(value: string): string {
    const date = new Date(`${value}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
  }

  private toLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
