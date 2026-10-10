import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-banner">
      <div class="page-shell py-14 sm:py-20">
        <p class="eyebrow">Encuéntranos en Cusco</p>
        <h1 class="section-title">Ubicación</h1>
        <p class="max-w-2xl leading-7 text-stone-600">En el centro histórico, a pasos de los lugares que hacen especial tu visita.</p>
      </div>
    </section>
    <section class="page-shell location-layout">
      <div class="map-frame">
        <iframe
          title="Google Maps: Chaquill Chak'a Hostal, Calle Belén 418, Cusco"
          src="https://maps.google.com/maps?q=Chaquill+Chak%27a+Hostal%2C+Calle+Bel%C3%A9n+418%2C+Cusco%2C+Per%C3%BA&z=17&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen></iframe>
        <a class="map-open" href="https://www.google.com/maps/search/?api=1&query=Chaquill%20Chak%27a%20Hostal%2C%20Calle%20Bel%C3%A9n%20418%2C%20Cusco%2C%20Per%C3%BA" target="_blank" rel="noopener noreferrer">Abrir Google Maps <span aria-hidden="true">↗</span></a>
      </div>
      <aside class="address-card surface-card">
        <p class="eyebrow">Estamos aquí</p>
        <h2 class="mt-2 font-serif text-3xl font-medium text-forest">A tu llegada,<br>bienvenido a casa.</h2>
        <p class="mt-5 leading-7 text-stone-600">Calle Belén N.° 418<br>Centro Histórico, Cusco, Perú</p>
        <p class="mt-5 text-sm leading-6 text-stone-600">Si necesitas indicaciones o coordinar tu llegada, escríbenos. Estaremos encantados de ayudarte.</p>
        <h3 class="contact-heading">Teléfonos de contacto</h3>
        <a class="contact-phone" href="tel:+5184211511">+51 84 211 511</a>
        <a class="contact-phone" href="tel:+51984992475">+51 984 992 475</a>
        <h3 class="contact-heading email-heading">Email</h3>
        <a class="contact-phone" href="mailto:reservas@chaquillchaka.com.pe">reservas@chaquillchaka.com.pe</a>
        <a class="facebook-contact" href="https://www.facebook.com/share/1RXQFG7D6Q/" target="_blank" rel="noopener noreferrer">Visítanos en Facebook <span aria-hidden="true">↗</span></a>
        <a class="primary-button mt-4" href="https://www.google.com/maps/search/?api=1&query=Chaquill%20Chak%27a%20Hostal%2C%20Calle%20Bel%C3%A9n%20418%2C%20Cusco%2C%20Per%C3%BA" target="_blank" rel="noopener noreferrer">Abrir Google Maps <span aria-hidden="true">↗</span></a>
        <a routerLink="/reserva" class="text-link mt-5 inline-block">Haz una reservación →</a>
      </aside>
    </section>
    <section class="page-shell surroundings-section" aria-labelledby="surroundings-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">A pasos del hostal</p>
          <h2 id="surroundings-title">Explora el barrio caminando</h2>
          <p>Distancias estimadas compartidas por el alojamiento; pueden variar según la ruta y el medio de transporte.</p>
        </div>
        <a class="text-link" [href]="googleMapsDirectionsUrl" target="_blank" rel="noopener noreferrer">Ver ruta en Google Maps ↗</a>
      </div>
      <div class="nearby-groups">
        <section class="nearby-category" *ngFor="let group of nearbyGroups">
          <h3><span aria-hidden="true">{{ group.icon }}</span>{{ group.title }}</h3>
          <div class="nearby-grid">
            <article class="nearby-card" *ngFor="let place of group.places">
              <span><strong>{{ place.name }}</strong><small>{{ place.distance }}</small></span>
            </article>
          </div>
        </section>
      </div>
    </section>
    <section class="page-shell property-details" aria-label="Servicios y normas del alojamiento">
      <article class="details-panel">
        <p class="eyebrow">Para una estancia cómoda</p>
        <h2>Servicios del alojamiento</h2>
        <p class="details-score"><strong>8,6 / 10</strong> · Puntuación de instalaciones y servicios compartida de Booking.com</p>
        <div class="amenity-groups">
          <section *ngFor="let group of amenityGroups">
            <h3><span aria-hidden="true">{{ group.icon }}</span>{{ group.name }}</h3>
            <ul><li *ngFor="let amenity of group.items">{{ amenity }}</li></ul>
          </section>
        </div>
        <p class="details-note">Algunos servicios, como traslados, lavandería o estacionamiento, pueden tener costo o requerir coordinación previa. Confirma disponibilidad al reservar.</p>
      </article>
      <article class="details-panel house-rules">
        <p class="eyebrow">Antes de tu llegada</p>
        <h2>Normas de la casa</h2>
        <dl>
          <div><dt>Entrada</dt><dd>Desde las 11:30</dd></div>
          <div><dt>Salida</dt><dd>Entre las 9:00 y las 11:00</dd></div>
          <div><dt>Niños</dt><dd>Se pueden alojar niños de cualquier edad. Desde los 6 años pagan como adultos.</dd></div>
          <div><dt>Camas supletorias</dt><dd>No hay cunas ni camas supletorias disponibles.</dd></div>
          <div><dt>Edad mínima</dt><dd>No hay edad mínima para hacer el check-in.</dd></div>
          <div><dt>Mascotas</dt><dd>No se admiten.</dd></div>
          <div><dt>Cancelación</dt><dd>Las condiciones de cancelación y prepago varían según la habitación y las fechas elegidas; se confirman antes de finalizar la reserva.</dd></div>
          <div><dt>Pago publicado</dt><dd>La información compartida del alojamiento indica solo efectivo. Consulta por teléfono si hay otras opciones disponibles.</dd></div>
        </dl>
        <a class="primary-button mt-5" routerLink="/reserva">Consultar disponibilidad <span aria-hidden="true">→</span></a>
      </article>
    </section>
  `,
  styles: [`
    .page-banner{background:#f2f1eb}
    .location-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(270px,.6fr);gap:30px;align-items:start;padding-block:54px 70px}
    .map-frame{position:relative;height:min(520px,65vh);min-height:430px;overflow:hidden;border:1px solid #dfe4dc;border-radius:7px;background:#e8eee6}
    .map-frame iframe{display:block;width:100%;height:100%;border:0}
    .map-open{position:absolute;right:15px;bottom:15px;border:1px solid #183b32;border-radius:4px;background:#fff;padding:10px 13px;color:#183b32;font-size:13px;font-weight:750;text-decoration:none;box-shadow:0 3px 12px #16231d20}
    .map-open:hover{background:#edf1ec}
    .address-card{align-self:start;padding:30px}
    .contact-phone,.facebook-contact{display:block;margin-top:13px;color:#183b32;font-size:14px;font-weight:700;text-underline-offset:3px}
    .contact-heading{margin:23px 0 0;color:#183b32;font-size:13px;font-weight:800}
    .email-heading{margin-top:18px}
    .surroundings-section{padding-bottom:58px}
    .section-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:18px}
    .section-heading h2,.details-panel h2{margin:7px 0;color:#183b32;font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.7rem,3vw,2.2rem);font-weight:500}
    .section-heading p:not(.eyebrow){margin:8px 0 0;color:#59635d;font-size:13px;line-height:1.6}
    .nearby-groups{display:grid;gap:22px}
    .nearby-category h3{margin:0 0 11px;color:#29362f;font-size:14px}
    .nearby-category h3 span{margin-right:9px;color:#183b32}
    .nearby-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .nearby-card{display:flex;min-height:62px;align-items:center;border:1px solid #e1e5de;border-radius:6px;background:#fff;padding:12px}
    .nearby-card strong,.nearby-card small{display:block}
    .nearby-card strong{color:#29362f;font-size:13px}
    .nearby-card small{margin-top:4px;color:#68716b;font-size:12px}
    .property-details{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:20px;padding-bottom:85px}
    .details-panel{border:1px solid #e1e5de;border-radius:7px;background:#fff;padding:clamp(18px,3vw,28px)}
    .details-score{margin:8px 0 20px;color:#59635d;font-size:12px}
    .details-score strong{color:#183b32;font-size:14px}
    .amenity-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 24px}
    .amenity-groups h3{margin:0 0 9px;color:#29362f;font-size:13px}
    .amenity-groups h3 span{margin-right:8px;color:#183b32}
    .amenity-groups ul{display:grid;gap:7px;margin:0;padding-left:20px;color:#59635d;font-size:12px;line-height:1.5}
    .details-note{margin:20px 0 0;border-top:1px solid #e6e8e2;padding-top:13px;color:#68716b;font-size:11px;line-height:1.55}
    .house-rules dl{margin:16px 0 0;border-top:1px solid #e6e8e2}
    .house-rules dl div{display:grid;grid-template-columns:105px minmax(0,1fr);gap:12px;border-bottom:1px solid #e6e8e2;padding:11px 0;font-size:12px;line-height:1.5}
    .house-rules dt{color:#59635d;font-weight:650}
    .house-rules dd{margin:0;color:#29362f}
    @media(max-width:760px){.location-layout{grid-template-columns:1fr;padding-block:28px 45px}.map-frame{height:420px;min-height:360px}.address-card{padding:23px}}
    @media(max-width:760px){.nearby-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.property-details{grid-template-columns:1fr;padding-bottom:60px}.section-heading{align-items:flex-start;flex-direction:column}}
    @media(max-width:480px){.nearby-grid,.amenity-groups{grid-template-columns:1fr}}
  `]
})
export class LocationComponent {
  readonly googleMapsDirectionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=Chaquill+Chak%27a+Hostal%2C+Calle+Bel%C3%A9n+418%2C+Cusco%2C+Per%C3%BA';

  readonly nearbyGroups = [
    {
      title: 'Lugares de interés',
      icon: '⌖',
      places: [
        { name: 'Plaza Belén', distance: '600 m' },
        { name: 'Qoricancha', distance: '650 m' },
        { name: 'Plaza de Armas de Cusco', distance: '700 m' },
        { name: 'Plaza Santiago', distance: '750 m' },
        { name: 'Parque Zonal Coripata', distance: '800 m' },
        { name: 'Museo de Arte Religioso', distance: '900 m' },
        { name: 'Hatun Rumiyoc · Piedra de los 12 ángulos', distance: '900 m' },
        { name: 'Museo Inca', distance: '1 km' },
        { name: 'Urpicha', distance: '1,6 km' },
        { name: 'Marianito Ferro Wanchaq', distance: '1,6 km' },
        { name: 'Ruinas de Sacsayhuamán', distance: '2 km' },
        { name: "Ruinas de Q'enqo", distance: '2 km' },
        { name: 'Ruinas de Pukapukara', distance: '5 km' }
      ]
    },
    {
      title: 'Restaurantes y cafeterías',
      icon: '♨',
      places: [
        { name: 'Restaurante Avventura', distance: '4 m' },
        { name: 'Restaurante Yan', distance: '5 m' },
        { name: 'Restaurante Donatelos', distance: '5 m' }
      ]
    },
    {
      title: 'Transporte y aeropuerto',
      icon: '⇄',
      places: [
        { name: 'Estación de tren San Pedro', distance: '600 m' },
        { name: 'Estación de tren Wanchaq', distance: '1,6 km' },
        { name: 'Estación central de autobuses', distance: '2,4 km' },
        { name: 'Aeropuerto Internacional Alejandro Velasco Astete', distance: '3,5 km' }
      ]
    }
  ];

  readonly amenityGroups = [
    { name: 'Servicios populares', icon: '✦', items: ['Wi-Fi gratis en todo el alojamiento', 'Traslado al aeropuerto (de pago)', 'Parking público en garaje cercano (US$ 5/día; requiere reserva)', 'Habitaciones familiares', 'Recepción 24 horas', 'Buen desayuno', 'Guardaequipaje', 'Información turística'] },
    { name: 'Baño y habitación', icon: '⌂', items: ['Baño privado con ducha y aseo', 'Papel higiénico y toallas', 'Lavabo adicional y artículos de aseo', 'Ropa de cama', 'Perchero', 'TV'] },
    { name: 'Cocina y comida', icon: '♨', items: ['Desayuno continental', 'Cocina compartida y productos de limpieza', 'Cafetería en el alojamiento', 'Fruta (de pago)'] },
    { name: 'Atención, limpieza y seguridad', icon: '♡', items: ['Servicio de lavandería y planchado', 'Limpieza diaria', 'Salón de TV compartido', 'Servicio de despertador', 'Extintores y cámaras en áreas comunes', 'Seguridad 24 horas', 'Español'] }
  ];
}
