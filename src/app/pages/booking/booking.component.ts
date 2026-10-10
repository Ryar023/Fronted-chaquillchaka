import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingSummaryModalComponent } from '../../components/booking-summary-modal/booking-summary-modal.component';
import { Booking } from '../../models/booking.interface';
import { Room } from '../../models/room.interface';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';

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
            <label class="field sm:col-span-2">
              <span>Nombre completo <span aria-hidden="true">*</span></span>
              <input class="form-control" type="text" formControlName="name" autocomplete="name" placeholder="Como aparece en tu documento" [attr.aria-invalid]="showError('name')" aria-describedby="name-error">
              <small *ngIf="showError('name')" id="name-error" class="field-error">Ingresa tu nombre completo (al menos 2 caracteres).</small>
            </label>
            <label class="field">
              <span>Correo electrónico <span aria-hidden="true">*</span></span>
              <input class="form-control" type="email" formControlName="email" autocomplete="email" placeholder="tu@correo.com" [attr.aria-invalid]="showError('email')" aria-describedby="email-error">
              <small *ngIf="showError('email')" id="email-error" class="field-error">Ingresa un correo electrónico válido.</small>
            </label>
            <label class="field">
              <span>Teléfono / WhatsApp <span aria-hidden="true">*</span></span>
              <input class="form-control" type="tel" formControlName="phone" autocomplete="tel" placeholder="+51 987 654 321" [attr.aria-invalid]="showError('phone')" aria-describedby="phone-error">
              <small *ngIf="showError('phone')" id="phone-error" class="field-error">Ingresa un teléfono válido.</small>
            </label>
            <label class="field sm:col-span-2">
              <span>Habitación <span aria-hidden="true">*</span></span>
              <select class="form-control" formControlName="roomId" [disabled]="loadingRooms || !!roomsError || rooms.length === 0" [attr.aria-invalid]="showError('roomId')" aria-describedby="room-error">
                <option value="">{{ loadingRooms ? 'Cargando habitaciones…' : roomsError ? 'No se pudieron cargar las habitaciones' : rooms.length ? 'Selecciona una habitación' : 'No hay habitaciones disponibles' }}</option>
                <option *ngFor="let room of rooms" [value]="room._id">{{ room.name }} · S/ {{ room.pricePen }} por noche · {{ room.capacity }} huésped(es)</option>
              </select>
              <small *ngIf="showError('roomId')" id="room-error" class="field-error">Selecciona una habitación disponible.</small>
            </label>
            <label class="field">
              <span>Fecha de llegada <span aria-hidden="true">*</span></span>
              <input class="form-control" type="date" formControlName="checkIn" [min]="today" (change)="onCheckInChange()" [attr.aria-invalid]="showError('checkIn') || hasPastCheckInError" aria-describedby="checkin-error">
              <small *ngIf="showError('checkIn') || hasPastCheckInError" id="checkin-error" class="field-error">{{ hasPastCheckInError ? 'La llegada no puede estar en el pasado.' : 'Elige una fecha de llegada válida desde hoy.' }}</small>
            </label>
            <label class="field">
              <span>Fecha de salida <span aria-hidden="true">*</span></span>
              <input class="form-control" type="date" formControlName="checkOut" [min]="checkOutMinimum" (change)="bookingForm.updateValueAndValidity()" [attr.aria-invalid]="showError('checkOut') || hasDateOrderError" aria-describedby="checkout-error">
              <small *ngIf="showError('checkOut') && !hasDateOrderError" id="checkout-error" class="field-error">Elige una fecha de salida.</small>
              <small *ngIf="hasDateOrderError" id="checkout-error" class="field-error">La salida debe ser posterior a la llegada.</small>
            </label>
            <label class="field">
              <span>Número de huéspedes <span aria-hidden="true">*</span></span>
              <input class="form-control" type="number" formControlName="guests" min="1" [max]="selectedRoom?.capacity || 20" step="1" [attr.aria-invalid]="showError('guests')" aria-describedby="guests-error">
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
              <small class="payment-note">La web aún no procesa pagos digitales. La información actual del alojamiento indica solo efectivo; confirma con el hostal si puede aceptar Yape, Plin o tarjeta antes de viajar. No ingreses datos de tarjeta en este formulario. Efectivo puede coordinarse en soles o dólares.</small>
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
          <p *ngIf="serverError" class="mt-4 rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900" role="alert">{{ serverError }}</p>
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
    paymentCurrency: this.formBuilder.nonNullable.control<'PEN' | 'USD'>('PEN', Validators.required)
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
      if (method === 'yape' || method === 'plin') {
        this.bookingForm.controls.paymentCurrency.setValue('PEN');
      }
    });
    this.route.queryParamMap.subscribe((queryParams) => {
      this.requestedRoomId = queryParams.get('roomId');
      if (!this.loadingRooms) this.applyRequestedRoom();
    });
    this.loadRooms();
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
    const { name, email, phone, roomId, checkIn, checkOut, guests, paymentMethod, paymentCurrency } = this.bookingForm.getRawValue();
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
      paymentCurrency
    }).subscribe({
      next: (booking) => {
        this.confirmedBooking = booking;
        this.bookingForm.reset({
          name: '',
          email: '',
          phone: '',
          roomId: '',
          checkIn: this.today,
          checkOut: '',
          guests: 1,
          paymentMethod: 'cash',
          paymentCurrency: 'PEN'
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
