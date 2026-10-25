import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-banner"><div class="page-shell py-14 sm:py-20">
      <p class="eyebrow">Hospitalidad cusqueña</p><h1 class="section-title max-w-3xl">Un lugar sencillo, hecho para sentirte cerca.</h1>
      <p class="max-w-2xl leading-7 text-stone-600">Creemos que viajar se disfruta más cuando encuentras un espacio acogedor al que volver.</p>
    </div></section>
    <section class="page-shell story-layout">
      <div class="story-photo" role="img" aria-label="Vista de la arquitectura histórica de Cusco"></div>
      <div><p class="eyebrow">Nuestra historia</p><h2 class="section-title">Cusco te recibe.<br>Nosotros también.</h2>
        <p class="leading-7 text-stone-600">Chaquill Chak'a es un hostal pensado para viajeros que quieren conocer la ciudad a su propio ritmo. Ofrecemos una estancia cómoda, atención cercana y una ubicación desde la que puedes explorar el corazón histórico de Cusco.</p>
        <p class="leading-7 text-stone-600">Queremos que cada huésped se sienta bienvenido, descanse con tranquilidad y se lleve un recuerdo especial de nuestra ciudad.</p>
        <a routerLink="/habitaciones" class="primary-button mt-4">Encuentra tu habitación <span aria-hidden="true">→</span></a>
      </div>
    </section>
    <section class="review-section"><div class="page-shell py-16">
      <div class="review-header">
        <div>
          <p class="eyebrow">Opiniones de huéspedes</p>
          <h2 class="section-title">La experiencia de quienes<br>ya se hospedaron.</h2>
        </div>
        <a class="booking-score" [href]="bookingUrl" target="_blank" rel="noopener noreferrer" aria-label="Ver ficha y opiniones de Chaquill Chak'a en Booking.com">
          <span class="score-number">8,9</span>
          <span><strong>Fabuloso</strong><small>663 opiniones en Booking.com</small></span>
        </a>
      </div>
      <p class="review-intro">Los huéspedes destacan especialmente la amabilidad del personal, la ubicación céntrica y el desayuno. Estas opiniones y puntuaciones pertenecen a Booking.com.</p>
      <div class="review-categories" aria-label="Puntuaciones por categoría publicadas en Booking.com">
        <div class="category-card"><span>Personal</span><strong>9,7</strong><div class="score-track"><span style="width:97%"></span></div></div>
        <div class="category-card"><span>Ubicación</span><strong>9,4</strong><div class="score-track"><span style="width:94%"></span></div></div>
        <div class="category-card"><span>Relación calidad-precio</span><strong>9,3</strong><div class="score-track"><span style="width:93%"></span></div></div>
        <div class="category-card"><span>Limpieza</span><strong>9,2</strong><div class="score-track"><span style="width:92%"></span></div></div>
        <div class="category-card"><span>Confort</span><strong>9,0</strong><div class="score-track"><span style="width:90%"></span></div></div>
        <div class="category-card"><span>Instalaciones</span><strong>8,6</strong><div class="score-track"><span style="width:86%"></span></div></div>
        <div class="category-card"><span>Wi-Fi gratis</span><strong>8,0</strong><div class="score-track"><span style="width:80%"></span></div></div>
      </div>
      <div class="comments-heading">
        <div>
          <p class="eyebrow">Comentarios de huéspedes</p>
          <h3>Lo que más les gustó</h3>
        </div>
        <div class="comment-controls" *ngIf="reviews.length > visibleReviews">
          <button type="button" aria-label="Comentarios anteriores" (click)="showPreviousReviews()">‹</button>
          <button type="button" aria-label="Comentarios siguientes" (click)="showNextReviews()">›</button>
        </div>
      </div>
      <div class="review-cards">
        <article class="review-card" *ngFor="let review of visibleReviewItems">
          <div class="review-author">
            <span class="review-avatar" aria-hidden="true"><span>{{ review.initials }}</span><img [src]="avatarFor(review)" alt="" loading="lazy" (error)="hideAvatar($event)"></span>
            <span><strong>{{ review.author }}</strong><small><span class="country-flag" [ngClass]="flagClass(review.country)" aria-hidden="true"></span>{{ review.country }}</small></span>
          </div>
          <h4>{{ review.title }}</h4>
          <p>{{ review.summary }}</p>
          <button type="button" class="more-link" (click)="openReview(review)">Más info</button>
        </article>
      </div>
      <button type="button" class="all-reviews-button" (click)="openAllReviews()">Leer todos los comentarios</button>
      <div class="review-source">
        <p>Opiniones resumidas a partir de los comentarios compartidos de Booking.com. Las fotos de perfil son avatares ilustrativos, no fotos verificadas de los huéspedes. La puntuación y el número de opiniones pueden cambiar.</p>
        <a [href]="bookingUrl" target="_blank" rel="noopener noreferrer">Consultar opiniones y puntuación actual en Booking.com <span aria-hidden="true">↗</span></a>
      </div>
    </div></section>
    <div *ngIf="selectedReview" class="review-modal-backdrop" role="presentation" (click)="closeReview()">
      <section class="review-modal" role="dialog" aria-modal="true" [attr.aria-label]="'Comentario de ' + selectedReview.author" (click)="$event.stopPropagation()">
        <button class="review-modal-close" type="button" aria-label="Cerrar comentario" (click)="closeReview()">×</button>
        <div class="review-modal-author">
          <div class="review-author">
            <span class="review-avatar" aria-hidden="true"><span>{{ selectedReview.initials }}</span><img [src]="avatarFor(selectedReview)" alt="" (error)="hideAvatar($event)"></span>
            <span><strong>{{ selectedReview.author }}</strong><small><span class="country-flag" [ngClass]="flagClass(selectedReview.country)" aria-hidden="true"></span>{{ selectedReview.country }}</small></span>
          </div>
          <small class="review-platform">Opinión compartida · Booking.com</small>
          <small *ngIf="selectedReview.date" class="review-modal-date">Fecha: {{ selectedReview.date }}</small>
          <small *ngIf="selectedReview.stay" class="review-modal-date">{{ selectedReview.stay }}</small>
        </div>
        <div class="review-modal-copy">
          <div class="review-modal-topline">
            <span>{{ selectedReview.title }}</span>
            <strong *ngIf="selectedReview.score !== undefined" class="individual-score">{{ selectedReview.score.toFixed(1).replace('.', ',') }}</strong>
          </div>
          <p>{{ selectedReview.detail }}</p>
        </div>
        <div class="review-reactions">
          <button type="button" [class.reaction-selected]="reactionFor(selectedReview) === 'useful'" [attr.aria-pressed]="reactionFor(selectedReview) === 'useful'" (click)="setReaction(selectedReview, 'useful')">
            <span aria-hidden="true">☞</span> Útil
          </button>
          <button type="button" [class.reaction-selected]="reactionFor(selectedReview) === 'not-useful'" [attr.aria-pressed]="reactionFor(selectedReview) === 'not-useful'" (click)="setReaction(selectedReview, 'not-useful')">
            <span aria-hidden="true">☟</span> Poco útil
          </button>
        </div>
      </section>
    </div>
    <div *ngIf="allReviewsOpen" class="review-modal-backdrop all-reviews-backdrop" role="presentation" (click)="closeAllReviews()">
      <section class="all-reviews-modal" role="dialog" aria-modal="true" aria-labelledby="all-reviews-title" (click)="$event.stopPropagation()">
        <header>
          <h2 id="all-reviews-title">Comentarios de clientes sobre Chaquill Chak'a</h2>
          <button type="button" aria-label="Cerrar todos los comentarios" (click)="closeAllReviews()">×</button>
        </header>
        <div class="all-reviews-list">
          <section class="review-overview">
            <div class="overall-score">
              <span class="overall-score-number">8,9</span>
              <span><strong>Fabuloso</strong><small>663 comentarios<br>según la información compartida</small></span>
            </div>
            <span class="review-trust">Resumen de comentarios compartidos · Booking.com</span>
          </section>
          <section class="modal-categories" aria-label="Puntuaciones por categoría">
            <h3>Categorías</h3>
            <div class="modal-category-grid">
              <div *ngFor="let category of reviewCategories"><span>{{ category.name }}</span><strong>{{ category.score }}</strong><span class="modal-score-track"><i [style.width.%]="category.score * 10"></i></span></div>
            </div>
          </section>
          <section class="review-filters" aria-label="Filtrar comentarios">
            <h3>Filtros</h3>
            <div class="filter-controls">
              <label>País
                <select [value]="countryFilter" (change)="setCountryFilter($any($event.target).value)">
                  <option value="Todos">Todos</option><option value="Colombia">Colombia</option><option value="España">España</option><option value="Chile">Chile</option><option value="Perú">Perú</option>
                </select>
              </label>
              <label>Puntuación
                <select [value]="ratingFilter" (change)="setRatingFilter($any($event.target).value)">
                  <option value="Todas">Todas</option><option value="10">10</option><option value="8">8 o más</option>
                </select>
              </label>
              <label>Tipo de viaje
                <select [value]="travelerFilter" (change)="setTravelerFilter($any($event.target).value)">
                  <option value="Todos">Todos</option><option value="En pareja">En pareja</option><option value="Persona que viaja sola">Viaja solo</option>
                </select>
              </label>
              <label>Ordenar
                <select [value]="reviewSort" (change)="setReviewSort($any($event.target).value)">
                  <option value="relevantes">Más relevantes</option><option value="recientes">Más recientes</option><option value="puntuacion">Mejor puntuación</option>
                </select>
              </label>
            </div>
            <p class="topic-label">Elige los temas de los comentarios:</p>
            <div class="topic-filters">
              <button *ngFor="let topic of reviewTopics" type="button" [class.topic-selected]="activeTopic === topic" [attr.aria-pressed]="activeTopic === topic" (click)="toggleTopic(topic)">{{ activeTopic === topic ? '✓' : '+' }} {{ topic }}</button>
              <button *ngIf="activeTopic" class="clear-filter" type="button" (click)="toggleTopic(activeTopic)">Quitar filtro</button>
            </div>
          </section>
          <section class="all-review-results">
            <div class="results-heading"><h3>Comentarios de clientes</h3><span>{{ filteredReviews.length }} de {{ reviews.length }} opiniones compartidas</span></div>
            <article class="full-review" *ngFor="let review of filteredReviews">
              <aside class="full-review-meta">
                <div class="review-author">
                  <span class="review-avatar" aria-hidden="true"><span>{{ review.initials }}</span><img [src]="avatarFor(review)" alt="" loading="lazy" (error)="hideAvatar($event)"></span>
                  <span><strong>{{ review.author }}</strong><small><span class="country-flag" [ngClass]="flagClass(review.country)" aria-hidden="true"></span>{{ review.country }}</small></span>
                </div>
                <div class="metadata-item" *ngIf="review.room"><span aria-hidden="true">▣</span>{{ review.room }}</div>
                <div class="metadata-item" *ngIf="review.stay"><span aria-hidden="true">▦</span>{{ review.stay }}</div>
                <div class="metadata-item" *ngIf="review.traveler"><span aria-hidden="true">♙</span>{{ review.traveler }}</div>
              </aside>
              <div class="full-review-copy">
                <div class="full-review-topline">
                  <span *ngIf="review.date">Fecha del comentario: {{ review.date }}</span>
                  <span *ngIf="review.score !== undefined" class="individual-score">{{ review.score.toFixed(1).replace('.', ',') }}</span>
                </div>
                <h3>{{ review.title }}</h3>
                <p class="review-mood"><span aria-hidden="true">☻</span>{{ review.detail }}</p>
                <div class="review-reactions">
                  <button type="button" [class.reaction-selected]="reactionFor(review) === 'useful'" [attr.aria-pressed]="reactionFor(review) === 'useful'" (click)="setReaction(review, 'useful')"><span aria-hidden="true">☞</span> Útil</button>
                  <button type="button" [class.reaction-selected]="reactionFor(review) === 'not-useful'" [attr.aria-pressed]="reactionFor(review) === 'not-useful'" (click)="setReaction(review, 'not-useful')"><span aria-hidden="true">☟</span> Poco útil</button>
                </div>
              </div>
            </article>
            <p *ngIf="filteredReviews.length === 0" class="no-reviews">No hay opiniones que coincidan con estos filtros.</p>
          </section>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-banner,.review-section{background:#f2f1eb}
    .story-layout{display:grid;grid-template-columns:1fr 1fr;gap:clamp(35px,8vw,95px);align-items:center;padding-block:75px}
    .story-photo{min-height:440px;border-radius:7px;background:#ddd4c5 url('/assets/images/slide_PatioD%C3%ADa1.jpg') center/cover}
    .review-header{display:flex;justify-content:space-between;align-items:end;gap:30px}
    .booking-score{display:flex;align-items:center;gap:15px;border-radius:7px;background:#183b32;padding:17px 22px;color:white;text-decoration:none}
    .score-number{font-size:30px;font-weight:800;letter-spacing:-.04em}
    .booking-score strong,.booking-score small{display:block}
    .booking-score small{margin-top:3px;color:#e2ebe6;font-size:12px}
    .review-intro{max-width:690px;margin:24px 0;color:#4f5b53;line-height:1.75}
    .review-categories{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}
    .category-card{display:grid;grid-template-columns:1fr auto;gap:11px;border:1px solid #e1e3dc;border-radius:5px;background:white;padding:14px;color:#47534c;font-size:13px}
    .category-card strong{color:#183b32;font-size:15px}
    .score-track{grid-column:1/-1;height:5px;overflow:hidden;border-radius:9px;background:#e7ebe5}
    .score-track span{display:block;height:100%;border-radius:9px;background:#a84e2c}
    .review-source{margin-top:23px;border-top:1px solid #dedfd8;padding-top:16px;font-size:12px;line-height:1.6;color:#59635d}
    .comments-heading{display:flex;justify-content:space-between;align-items:end;gap:20px;margin:35px 0 15px}
    .comments-heading .eyebrow{margin:0 0 5px}
    .comments-heading h3{margin:0;color:#183b32;font-size:1.55rem;font-weight:600}
    .comment-controls{display:flex;gap:8px}
    .comment-controls button{width:38px;height:38px;border:1px solid #dfe4dd;border-radius:50%;background:white;color:#183b32;font-size:24px;line-height:1;cursor:pointer}
    .review-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .review-card{border:1px solid #e1e3dc;border-radius:6px;background:white;padding:14px}
    .review-author{display:flex;align-items:center;gap:10px}
    .review-avatar{display:grid;width:38px;height:38px;flex:none;place-items:center;border-radius:50%;background:#e9efe9;color:#183b32;font-size:13px;font-weight:800}
    .review-author strong,.review-author small{display:block}
    .review-author strong{color:#29362f;font-size:13px}
    .review-author small{margin-top:3px;color:#68716b;font-size:12px}
    .review-card h4{margin:13px 0 7px;color:#27372f;font-size:15px}
    .review-card p,.review-modal p,.full-review-copy p{margin:0;color:#4f5b53;font-size:13px;line-height:1.65}
    .more-link{margin-top:9px;border:0;background:none;padding:0;color:#225ca8;font-size:13px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
    .all-reviews-button{margin-top:18px;border:1px solid #183b32;border-radius:4px;background:white;padding:10px 14px;color:#183b32;font-weight:700;cursor:pointer}
    .review-modal-backdrop{position:fixed;z-index:1100;inset:0;display:grid;place-items:center;overflow:auto;background:#121916a6;padding:20px}
    .review-modal{position:relative;width:min(700px,100%);border-radius:9px;background:white;padding:30px}
    .review-modal-close{position:absolute;top:10px;right:12px;border:0;background:none;color:#49534d;font-size:26px;cursor:pointer}
    .review-reactions{display:flex;justify-content:flex-end;gap:15px;margin-top:22px}
    .review-reactions button{display:inline-flex;align-items:center;gap:6px;border:0;background:transparent;padding:6px 3px;color:#2563a9;font-size:13px;font-weight:650;cursor:pointer}
    .review-reactions button:hover,.review-reactions button.reaction-selected{color:#183b32;text-decoration:underline;text-underline-offset:3px}
    .all-reviews-modal{display:flex;width:min(950px,100%);max-height:min(85vh,820px);flex-direction:column;border-radius:8px;background:white}
    .all-reviews-modal header{display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:1px solid #e1e3dc;padding:16px 22px}
    .all-reviews-modal header h2{margin:0;color:#27372f;font-size:18px}
    .all-reviews-modal header button{flex:none;border:0;background:none;color:#49534d;font-size:25px;cursor:pointer}
    .all-reviews-list{overflow-y:auto;padding:0 22px}
    .review-overview{display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid #e1e3dc;padding:18px 0}
    .overall-score{display:flex;align-items:center;gap:13px}
    .overall-score-number,.individual-score{display:inline-grid;min-width:38px;min-height:38px;place-items:center;border-radius:4px;background:#0753a5;padding:5px;color:white;font-size:17px;font-weight:800}
    .overall-score strong,.overall-score small{display:block}
    .overall-score strong{font-size:14px}.overall-score small{margin-top:3px;color:#68716b;font-size:12px;line-height:1.4}
    .review-trust{color:#35835e;font-size:12px}
    .modal-categories,.review-filters{border-bottom:1px solid #e1e3dc;padding:18px 0}
    .modal-categories h3,.review-filters h3,.results-heading h3{margin:0 0 14px;color:#303a34;font-size:15px}
    .modal-category-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 24px}
    .modal-category-grid>div{display:grid;grid-template-columns:1fr auto;gap:6px;color:#4f5b53;font-size:12px}
    .modal-category-grid strong{font-weight:650}.modal-score-track{grid-column:1/-1;height:6px;overflow:hidden;border-radius:5px;background:#e7ebe5}
    .modal-score-track i{display:block;height:100%;background:#0753a5}
    .filter-controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
    .filter-controls label{display:grid;gap:6px;color:#5c665f;font-size:12px}
    .filter-controls select{width:100%;min-width:0;border:1px solid #cfd5d0;border-radius:4px;background:white;padding:8px;color:#303a34;font-size:12px}
    .topic-label{margin:17px 0 9px;color:#5c665f;font-size:12px}
    .topic-filters{display:flex;flex-wrap:wrap;gap:8px}
    .topic-filters button{border:1px solid #cfd5d0;border-radius:22px;background:white;padding:7px 11px;color:#48544d;font-size:12px;cursor:pointer}
    .topic-filters button.topic-selected{border-color:#183b32;background:#edf3ed;color:#183b32;font-weight:750}
    .topic-filters button.clear-filter{border-color:transparent;color:#2563a9;text-decoration:underline}
    .all-review-results{padding-top:19px}
    .results-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
    .results-heading span{color:#68716b;font-size:12px}
    .full-review{display:grid;grid-template-columns:170px minmax(0,1fr);gap:20px;border-bottom:1px solid #e1e3dc;padding:20px 0}
    .full-review-meta{display:flex;flex-direction:column;gap:12px}
    .metadata-item{display:flex;align-items:flex-start;gap:9px;color:#525e56;font-size:12px;line-height:1.5}
    .metadata-item>span{width:17px;flex:none;color:#657268;text-align:center}
    .full-review-copy h3{margin:4px 0 8px;color:#27372f;font-size:16px}
    .full-review-topline{display:flex;align-items:center;justify-content:space-between;min-height:28px;color:#68716b;font-size:12px}
    .individual-score{min-width:29px;min-height:29px;font-size:13px}
    .review-mood{display:flex;gap:9px;align-items:flex-start}
    .review-mood>span{color:#25815a;font-size:18px;line-height:1}
    .no-reviews{padding:20px;color:#5c665f;text-align:center}
    @media(max-width:700px){
      .story-layout{grid-template-columns:1fr;padding-block:45px 60px}.story-photo{min-height:285px}
      .review-header{align-items:flex-start;flex-direction:column}.booking-score{width:100%}
      .review-categories{grid-template-columns:repeat(2,minmax(0,1fr))}
      .review-cards{grid-template-columns:1fr}.full-review{grid-template-columns:1fr;gap:10px}
      .review-modal{padding:25px 20px}.all-reviews-modal{max-height:90vh}.all-reviews-modal header{padding:13px 15px}.all-reviews-list{padding:0 15px}
      .review-overview{align-items:flex-start;flex-direction:column}.modal-category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .filter-controls{grid-template-columns:repeat(2,minmax(0,1fr))}.full-review{grid-template-columns:1fr;gap:11px}
    }
  `]
})
export class AboutComponent {
  readonly bookingUrl = 'https://www.booking.com/hotel/pe/chaquill-chak-39-a-cusco.es.html';
  readonly visibleReviews = 3;
  readonly reviewTopics = ['Desayuno', 'Ubicación', 'Agua', 'Habitación', 'Centro'];
  readonly reviewCategories = [
    { name: 'Ubicación', score: 9.4 },
    { name: 'Limpieza', score: 9.2 },
    { name: 'Relación calidad-precio', score: 9.3 },
    { name: 'Instalaciones y servicios', score: 8.6 },
    { name: 'Confort', score: 9.0 },
    { name: 'Personal', score: 9.7 },
    { name: 'Wi-Fi gratis', score: 8.0 }
  ];
  reviewStart = 0;
  countryFilter = 'Todos';
  ratingFilter = 'Todas';
  travelerFilter = 'Todos';
  reviewSort = 'relevantes';
  activeTopic = '';
  selectedReview: GuestReview | null = null;
  allReviewsOpen = false;
  private readonly reactions: Record<string, 'useful' | 'not-useful' | undefined> = {};
  readonly reviews: GuestReview[] = [
    { author: 'Sanchez', country: 'Colombia', flag: '🇨🇴', initials: 'S', title: 'Muy amables, ambiente cálido', summary: 'Destaca el trato amable del personal, el ambiente familiar y la ayuda con el box lunch.', detail: 'La opinión destaca que el trato del personal fue muy amable y que el ambiente hizo sentir al huésped como en casa. También menciona con cariño a los animales del hostal y agradece el box lunch para las excursiones.', score: 10, date: '5 de octubre de 2026', room: 'Habitación Doble', stay: '3 noches · septiembre de 2026', traveler: 'En pareja', topics: ['Ubicación', 'Habitación'] },
    { author: 'Enzo', country: 'España', flag: '🇪🇸', initials: 'E', title: 'Atención y desayuno excelentes', summary: 'Le gustaron la atención, la ubicación, el desayuno y la estancia en general.', detail: 'El comentario valora la atención recibida y la buena ubicación. También destaca el desayuno y la experiencia general durante la estancia.', score: 10, date: '4 de septiembre de 2026', room: 'Habitación Doble - 2 camas', stay: '2 noches · agosto de 2026', traveler: 'Persona que viaja sola', topics: ['Desayuno', 'Ubicación', 'Habitación', 'Centro'] },
    { author: 'Enzo', country: 'España', flag: '🇪🇸', initials: 'E', title: 'Ubicación excelente, servicio aún mejor', summary: 'Menciona la ubicación, el buen servicio, el desayuno y las mantas para el frío.', detail: 'El huésped comenta que la ubicación es excelente y destaca aún más el servicio, además del desayuno y las mantas para el frío.', topics: ['Desayuno', 'Ubicación', 'Agua', 'Centro'] },
    { author: 'Marcela', country: 'Colombia', flag: '🇨🇴', initials: 'M', title: 'Personal atento y servicial', summary: 'Agradece la disposición del equipo para ayudar con lo que necesitó durante su visita.', detail: 'La opinión resalta la amabilidad del personal y su disposición para atender requerimientos, prestando artículos y ayudando a que la estancia fuera confortable.', date: '25 de agosto de 2026', room: 'Habitación Doble - 2 camas', stay: '6 noches · agosto de 2026', topics: ['Habitación'] },
    { author: 'Gio', country: 'España', flag: '🇪🇸', initials: 'G', title: 'Una estancia acogedora', summary: 'Destaca el ambiente auténtico y la amabilidad de Rosa y de todo el personal.', detail: 'El huésped recuerda una estancia acogedora y auténtica, y destaca la atención amable de Rosa y del equipo del hostal.', topics: ['Ubicación'] },
    { author: 'Joselyn', country: 'Chile', flag: '🇨🇱', initials: 'J', title: 'Amabilidad, ubicación y limpieza', summary: 'Valora especialmente el trato amable, lo céntrico del hostal y la limpieza.', detail: 'La opinión destaca tres aspectos de su visita: la amabilidad del personal, la ubicación céntrica y la limpieza.', topics: ['Ubicación', 'Centro'] },
    { author: 'Raúl', country: 'Chile', flag: '🇨🇱', initials: 'R', title: 'Atención que hace sentir como en casa', summary: 'Describe una recepción amable y atenta que hizo más confortable su visita.', detail: 'El huésped destaca la atención de recepción, que describe como amable y atenta, y comenta que eso hizo que su estancia fuera confortable.', topics: ['Habitación'] },
    { author: 'Aravena', country: 'Chile', flag: '🇨🇱', initials: 'A', title: 'Apoyo desde la llegada', summary: 'Agradece que lo esperaran, guardaran su equipaje y le brindaran una atención excelente.', detail: 'La opinión agradece el apoyo del equipo desde la llegada, incluyendo la espera y el resguardo del equipaje, además de la buena atención.', topics: ['Ubicación'] },
    { author: 'Delgado', country: 'Chile', flag: '🇨🇱', initials: 'D', title: 'Instalaciones y amabilidad', summary: 'Valora las instalaciones y la amabilidad de las personas que trabajan en el hostal.', detail: 'El huésped señala como aspectos positivos las instalaciones y la amabilidad de quienes trabajan en el alojamiento.', topics: ['Habitación'] },
    { author: 'Susana', country: 'España', flag: '🇪🇸', initials: 'S', title: 'Una anfitriona encantadora', summary: 'Recuerda con cariño la atención de Rosa y agradece el trato cercano.', detail: 'La opinión describe a Rosa como una anfitriona encantadora y atenta, y expresa agradecimiento por la atención recibida durante la visita.', topics: ['Ubicación'] },
    { author: 'Alberto', country: 'Perú', flag: '🇵🇪', initials: 'A', title: 'Bueno, bonito y barato', summary: 'Menciona como punto positivo la cercanía a la plaza principal.', detail: 'El comentario destaca lo cerca que está el alojamiento de la plaza principal.', score: 8, date: '2 de septiembre de 2026', room: 'Habitación Doble - 2 camas', stay: '5 noches · septiembre de 2026', traveler: 'Persona que viaja sola', topics: ['Ubicación', 'Centro'] }
  ];

  get visibleReviewItems(): GuestReview[] {
    return Array.from({ length: Math.min(this.visibleReviews, this.reviews.length) }, (_, offset) =>
      this.reviews[(this.reviewStart + offset) % this.reviews.length]
    );
  }

  get filteredReviews(): GuestReview[] {
    let results = this.reviews.filter((review) =>
      (this.countryFilter === 'Todos' || review.country === this.countryFilter) &&
      (this.ratingFilter === 'Todas' || (review.score !== undefined && review.score >= Number(this.ratingFilter))) &&
      (this.travelerFilter === 'Todos' || review.traveler === this.travelerFilter) &&
      (!this.activeTopic || review.topics.includes(this.activeTopic))
    );

    if (this.reviewSort === 'recientes') {
      results = [...results].sort((left, right) => this.reviewTimestamp(right.date) - this.reviewTimestamp(left.date));
    } else if (this.reviewSort === 'puntuacion') {
      results = [...results].sort((left, right) => (right.score ?? -1) - (left.score ?? -1));
    }
    return results;
  }

  private reviewTimestamp(date?: string): number {
    if (!date) return 0;
    const match = date.match(/(\d{1,2}) de ([a-záéíóú]+) de (\d{4})/i);
    if (!match) return 0;
    const months: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    const month = months[match[2].toLowerCase()];
    return month === undefined ? 0 : new Date(Number(match[3]), month, Number(match[1])).getTime();
  }

  showPreviousReviews(): void {
    this.reviewStart = (this.reviewStart - 1 + this.reviews.length) % this.reviews.length;
  }

  showNextReviews(): void {
    this.reviewStart = (this.reviewStart + 1) % this.reviews.length;
  }

  openReview(review: GuestReview): void {
    this.allReviewsOpen = false;
    this.selectedReview = review;
  }

  closeReview(): void {
    this.selectedReview = null;
  }

  openAllReviews(): void {
    this.selectedReview = null;
    this.allReviewsOpen = true;
  }

  closeAllReviews(): void {
    this.allReviewsOpen = false;
  }

  setCountryFilter(value: string): void {
    this.countryFilter = value;
  }

  setRatingFilter(value: string): void {
    this.ratingFilter = value;
  }

  setTravelerFilter(value: string): void {
    this.travelerFilter = value;
  }

  setReviewSort(value: string): void {
    this.reviewSort = value;
  }

  avatarFor(review: GuestReview): string {
    const avatarIds: Record<string, number> = {
      Sanchez: 47,
      Enzo: 12,
      Marcela: 44,
      Gio: 11,
      Joselyn: 37,
      'Raúl': 60,
      Aravena: 5,
      Delgado: 32,
      Susana: 46,
      Alberto: 14
    };
    return `https://i.pravatar.cc/96?img=${avatarIds[review.author] ?? 1}`;
  }

  flagClass(country: string): string {
    const classes: Record<string, string> = {
      Colombia: 'flag-colombia',
      España: 'flag-espana',
      Chile: 'flag-chile',
      Perú: 'flag-peru'
    };
    return classes[country] ?? '';
  }

  hideAvatar(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  toggleTopic(topic: string): void {
    this.activeTopic = this.activeTopic === topic ? '' : topic;
  }

  reactionFor(review: GuestReview): 'useful' | 'not-useful' | undefined {
    return this.reactions[review.author + review.title];
  }

  setReaction(review: GuestReview, reaction: 'useful' | 'not-useful'): void {
    const key = review.author + review.title;
    this.reactions[key] = this.reactions[key] === reaction ? undefined : reaction;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeReview();
    this.closeAllReviews();
  }
}

interface GuestReview {
  author: string;
  country: string;
  flag: string;
  initials: string;
  title: string;
  summary: string;
  detail: string;
  score?: number;
  date?: string;
  room?: string;
  stay?: string;
  traveler?: string;
  topics: string[];
}
