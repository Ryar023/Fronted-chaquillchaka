import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Room } from '../../models/room.interface';
import { getRoomImageUrl } from '../../models/room-image';
import { RoomService } from '../../services/room.service';

type HotspotId = 'bed' | 'bath' | 'patio';
type SceneId = 'room' | 'bathroom' | 'shower' | 'breakfast' | 'patio';

interface TourHotspot {
  id: HotspotId;
  label: string;
  top: string;
  left: string;
  yaw: number;
  pitch: number;
}

@Component({
  selector: 'app-tour-ar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="tour-hero">
      <div class="page-shell">
        <p class="eyebrow">Explora antes de reservar</p>
        <h1 class="section-title">Vista inmersiva de las habitaciones</h1>
        <p>Elige una habitación o ambiente y explóralo en 360°. Arrastra la imagen, usa las flechas del teclado o los controles accesibles. Abre el visor para verlo a pantalla completa.</p>
      </div>
    </section>

    <section class="page-shell tour-content">
      <div *ngIf="loading" class="tour-status" role="status" aria-live="polite">Cargando habitaciones…</div>
      <div *ngIf="errorMessage" class="tour-status tour-error" role="alert">
        <p>{{ errorMessage }}</p>
        <button class="tour-button" type="button" (click)="loadRooms()">Volver a intentar</button>
      </div>
      <p *ngIf="roomsWarning" class="tour-status" role="status">{{ roomsWarning }}</p>

      <ng-container *ngIf="!loading && rooms.length">
        <div class="room-picker" role="group" aria-label="Selecciona una habitación para explorar">
          <button
            *ngFor="let room of rooms"
            class="room-picker-button"
            type="button"
            [attr.aria-pressed]="selectedRoom?._id === room._id"
            (click)="selectRoom(room)">
            {{ room.type }}
          </button>
        </div>

        <div class="scene-picker" role="group" aria-label="Selecciona un ambiente panorámico">
          <button
            *ngFor="let scene of scenes"
            class="scene-picker-button"
            type="button"
            [attr.aria-pressed]="activeSceneId === scene.id"
            (click)="selectScene(scene.id)">
            {{ scene.label }}
          </button>
        </div>

        <section *ngIf="selectedRoom as room" class="tour-layout" aria-label="Recorrido de la habitación">
          <div class="tour-viewer-column">
            <div
              class="tour-viewer"
              [class.tour-viewer-expanded]="isExpanded"
              role="region"
              tabindex="0"
              [attr.aria-label]="'Visor interactivo 360 grados de ' + activeSceneLabel + '. Usa las flechas para girar e inclinar la vista.'"
              (pointerdown)="startDrag($event)"
              (pointerup)="endDrag($event)"
              (pointercancel)="cancelDrag()"
              (keydown)="onViewerKeydown($event)">
              <canvas
                #panoramaCanvas
                class="tour-panorama-canvas"
                [hidden]="!has360Panorama || !!panoramaError"
                role="img"
                [attr.aria-label]="'Panorama 360 grados: ' + activeSceneLabel">
              </canvas>
              <img
                *ngIf="!has360Panorama || panoramaError"
                class="tour-room-image"
                [src]="fallbackImageUrl"
                [alt]="room.type === 'Matrimonial' ? 'Ilustración generada por IA de una habitación matrimonial ficticia; no corresponde al hostal' : room.name + ', fotografía ilustrativa; no es una vista 360 grados'"
                [style.transform]="imageTransform"
                draggable="false">
              <button
                *ngIf="!isExpanded"
                #expandButton
                class="expand-viewer-button"
                type="button"
                aria-label="Abrir visor 360 grados a pantalla completa"
                title="Abrir a pantalla completa"
                (pointerdown)="$event.stopPropagation()"
                (click)="openExpandedViewer()">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />
                </svg>
              </button>
              <div *ngIf="isExpanded" class="expanded-viewer-controls" role="group" aria-label="Controles del visor ampliado">
                <button class="expanded-control-button" type="button" aria-label="Girar a la izquierda" (pointerdown)="$event.stopPropagation()" (click)="rotate(-20)">←</button>
                <button class="expanded-control-button" type="button" aria-label="Girar a la derecha" (pointerdown)="$event.stopPropagation()" (click)="rotate(20)">→</button>
                <button class="expanded-control-button" type="button" aria-label="Mirar arriba" (pointerdown)="$event.stopPropagation()" (click)="tilt(10)">↑</button>
                <button class="expanded-control-button" type="button" aria-label="Mirar abajo" (pointerdown)="$event.stopPropagation()" (click)="tilt(-10)">↓</button>
                <button #closeButton class="expanded-control-button expanded-close-button" type="button" aria-label="Cerrar visor ampliado" title="Cerrar (Esc)" (pointerdown)="$event.stopPropagation()" (click)="closeExpandedViewer()">
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <div class="viewer-shade" aria-hidden="true"></div>
              <div class="viewer-title">
                <span>{{ activeSceneLabel }}</span>
                <span>{{ room.capacity }} {{ room.capacity === 1 ? 'huésped' : 'huéspedes' }}</span>
              </div>
              <div class="hotspots-layer" [style.transform]="imageTransform">
                <button
                  *ngFor="let hotspot of hotspots"
                  [hidden]="has360Panorama && !isHotspotVisible(hotspot)"
                  class="hotspot"
                  [class.selected]="activeHotspotId === hotspot.id"
                  type="button"
                  [style.top]="hotspotPosition(hotspot).top"
                  [style.left]="hotspotPosition(hotspot).left"
                  [attr.aria-label]="'Ver información: ' + hotspot.label"
                  [attr.aria-pressed]="activeHotspotId === hotspot.id"
                  (pointerdown)="$event.stopPropagation()"
                  (click)="showHotspot(hotspot.id)">
                  <span aria-hidden="true">+</span>
                  <span class="hotspot-label">{{ hotspot.label }}</span>
                </button>
              </div>
            </div>

            <div class="viewer-controls" role="group" aria-label="Controles para girar la vista">
              <button class="tour-button" type="button" aria-label="Girar vista a la izquierda" (click)="rotate(-20)">← Girar</button>
              <span class="view-angle" role="status" aria-live="polite">{{ has360Panorama ? 'Vista 360°' : 'Vista simulada' }}: {{ angle }}°</span>
              <button class="tour-button" type="button" aria-label="Girar vista a la derecha" (click)="rotate(20)">Girar →</button>
              <ng-container *ngIf="has360Panorama">
                <button class="tour-button tilt-control" type="button" aria-label="Inclinar vista hacia arriba" (click)="tilt(10)">↑ Mirar arriba</button>
                <button class="tour-button tilt-control" type="button" aria-label="Inclinar vista hacia abajo" (click)="tilt(-10)">↓ Mirar abajo</button>
              </ng-container>
            </div>
            <p class="gesture-hint">En móvil, desliza horizontalmente. Con teclado, enfoca la imagen y usa ← / → para girar y ↑ / ↓ para inclinar. También puedes usar los botones.</p>
            <p *ngIf="panoramaError" class="panorama-error" role="status">{{ panoramaError }} Se muestra la fotografía ilustrativa como alternativa.</p>
          </div>

          <aside class="hotspot-details" aria-live="polite" aria-atomic="true">
            <p class="eyebrow">Punto de interés</p>
            <h2>{{ activeHotspotTitle }}</h2>
            <p>{{ activeHotspotDescription }}</p>
            <figure *ngIf="activeHotspotId === 'patio'">
              <img src="/assets/images/Vista-Comedorvista%202.jpg" alt="Patio y áreas comunes del hostal; el catálogo no indica que la habitación tenga vista directa al patio" loading="lazy">
              <figcaption>Área común del hostal. No se garantiza vista directa desde la habitación.</figcaption>
            </figure>
            <a class="primary-button reserve-room" data-direct-booking-navigation [routerLink]="['/reserva']" [queryParams]="{ roomId: room._id }">
              Reservar esta habitación ahora
            </a>
          </aside>
        </section>
      </ng-container>
    </section>
  `,
  styles: [`
    .tour-hero { background:#f2f1eb; padding:36px 0; }
    .tour-hero .section-title { margin-bottom:12px; }
    .tour-hero p { max-width:760px; color:#4f5b53; line-height:1.65; }
    .tour-content { padding-block:28px 56px; }
    .tour-status { padding:18px; border-radius:6px; background:#f3f5f2; color:#26362e; }
    .tour-error { border:1px solid #a12e21; background:#fff5f4; }
    .room-picker { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-bottom:20px; }
    .room-picker-button,.tour-button { display:inline-flex; min-width:48px; min-height:48px; align-items:center; justify-content:center; gap:8px; border:2px solid #183b32; border-radius:6px; background:#fff; padding:10px 14px; color:#183b32; font:inherit; font-weight:700; cursor:pointer; }
    .room-picker-button[aria-pressed="true"] { background:#183b32; color:#fff; }
    .scene-picker { display:flex; flex-wrap:wrap; gap:8px; margin:-8px 0 20px; }
    .scene-picker-button { min-width:48px; min-height:48px; border:1px solid #183b32; border-radius:6px; background:#fff; padding:8px 14px; color:#183b32; font:inherit; font-weight:700; cursor:pointer; }
    .scene-picker-button[aria-pressed="true"] { background:#e9f0e9; box-shadow:inset 0 0 0 2px #183b32; }
    .tour-layout { display:grid; grid-template-columns:minmax(0,1.5fr) minmax(270px,.8fr); gap:24px; align-items:start; }
    .tour-viewer { position:relative; min-height:320px; aspect-ratio:16/10; overflow:hidden; border-radius:10px; background:#202a24; touch-action:pan-y; cursor:grab; }
    .tour-viewer:active { cursor:grabbing; }
    .tour-viewer-expanded { position:fixed; z-index:1200; inset:0; width:100vw; height:100vh; height:100dvh; min-height:0; aspect-ratio:auto; border-radius:0; cursor:grab; touch-action:none; }
    .expand-viewer-button,.expanded-control-button { display:grid; width:48px; min-width:48px; height:48px; min-height:48px; place-items:center; border:2px solid #fff; border-radius:8px; background:#183b32; color:#fff; cursor:pointer; box-shadow:0 2px 10px #0008; }
    .expand-viewer-button { position:absolute; z-index:4; top:12px; right:12px; }
    .expand-viewer-button svg,.expanded-control-button svg { width:22px; height:22px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
    .expanded-viewer-controls { position:absolute; z-index:4; top:12px; right:12px; left:12px; display:flex; flex-wrap:wrap; gap:8px; pointer-events:none; }
    .expanded-control-button { pointer-events:auto; font-size:22px; font-weight:700; }
    .expanded-close-button { margin-left:auto; }
    .tour-panorama-canvas { position:absolute; inset:0; display:block; width:100%; height:100%; }
    .tour-panorama-canvas[hidden] { display:none; }
    .tour-room-image { width:100%; height:100%; max-width:100%; object-fit:cover; user-select:none; transition:transform .18s ease-out; }
    .hotspots-layer { position:absolute; inset:0; pointer-events:none; transition:transform .18s ease-out; }
    .viewer-shade { position:absolute; inset:45% 0 0; pointer-events:none; background:linear-gradient(transparent,#101714aa); }
    .viewer-title { position:absolute; right:16px; bottom:14px; left:16px; display:flex; justify-content:space-between; gap:12px; color:#fff; font-weight:700; text-shadow:0 1px 5px #000; pointer-events:none; }
    .hotspot { position:absolute; z-index:2; display:grid; width:48px; min-width:48px; height:48px; min-height:48px; place-content:center; border:2px solid #fff; border-radius:50%; background:#183b32; color:#fff; font-size:22px; font-weight:800; cursor:pointer; box-shadow:0 2px 10px #0008; pointer-events:auto; }
    .hotspot.selected { background:#a84e2c; outline:3px solid #fff; outline-offset:2px; }
    .hotspot-label { position:absolute; top:50px; left:50%; border-radius:4px; background:#17221f; padding:4px 7px; color:#fff; font-size:12px; font-weight:700; white-space:nowrap; transform:translateX(-50%); }
    .viewer-controls { display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:center; margin-top:12px; }
    .viewer-controls .tour-button:last-child { justify-self:end; }
    .viewer-controls .tilt-control { justify-self:stretch; }
    .view-angle { color:#34443a; font-size:13px; font-weight:700; text-align:center; }
    .gesture-hint { margin:10px 0 0; color:#59635d; font-size:13px; line-height:1.5; }
    .panorama-error { margin:8px 0 0; color:#8c1d18; font-size:13px; line-height:1.5; }
    .hotspot-details { border:1px solid #dfe5dc; border-radius:8px; background:#fff; padding:20px; }
    .hotspot-details h2 { margin:8px 0; color:#183b32; font-family:Georgia,"Times New Roman",serif; font-size:1.6rem; font-weight:500; }
    .hotspot-details > p:not(.eyebrow) { color:#4f5b53; line-height:1.65; }
    .hotspot-details figure { margin:16px 0; }
    .hotspot-details figure img { display:block; width:100%; max-width:100%; height:auto; border-radius:6px; }
    .hotspot-details figcaption { margin-top:7px; color:#59635d; font-size:12px; line-height:1.5; }
    .reserve-room { width:100%; text-align:center; }
    @media(max-width:767px) {
      .tour-hero { padding-block:26px; }
      .tour-content { padding-bottom:24px; }
      .tour-layout { grid-template-columns:1fr; }
      .tour-viewer:not(.tour-viewer-expanded) { min-height:240px; aspect-ratio:4/3; }
    }
    @media(min-width:768px) { .room-picker { grid-template-columns:repeat(4,minmax(0,1fr)); } }
    @media(max-width:420px) {
      .room-picker { grid-template-columns:1fr 1fr; gap:8px; }
      .room-picker-button { padding-inline:8px; font-size:13px; }
      .viewer-controls { grid-template-columns:1fr 1fr; }
      .view-angle { grid-column:1/-1; grid-row:1; }
      .viewer-controls .tour-button:last-child { justify-self:stretch; }
    }
    @media(prefers-reduced-motion:reduce) { .tour-room-image { transition:none; } }
  `]
})
export class TourArComponent implements OnInit, OnDestroy {
  private panoramaCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('expandButton') private expandButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('panoramaCanvas')
  set panoramaCanvasRef(canvas: ElementRef<HTMLCanvasElement> | undefined) {
    this.panoramaCanvas = canvas;
    if (canvas && !this.viewerInitializationStarted) {
      this.viewerInitializationStarted = true;
      this.initializePanoramaViewer();
      if (this.has360Panorama) this.loadPanorama();
    } else if (canvas && this.has360Panorama) {
      this.loadPanorama();
    }
  }

  readonly hotspots: TourHotspot[] = [
    { id: 'bed', label: 'Cama', top: '48%', left: '28%', yaw: -18, pitch: -5 },
    { id: 'bath', label: 'Baño', top: '38%', left: '58%', yaw: 28, pitch: 8 },
    { id: 'patio', label: 'Patio', top: '55%', left: '80%', yaw: 62, pitch: -7 }
  ];

  readonly scenes: { id: SceneId; label: string }[] = [
    { id: 'room', label: 'Habitación' },
    { id: 'bathroom', label: 'Baño' },
    { id: 'shower', label: 'Ducha' },
    { id: 'breakfast', label: 'Desayuno' },
    { id: 'patio', label: 'Patio' }
  ];

  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  activeSceneId: SceneId = 'room';
  loading = true;
  errorMessage = '';
  roomsWarning = '';
  angle = 0;
  verticalAngle = 0;
  isExpanded = false;
  activeHotspotId: HotspotId = 'bed';
  panoramaError = '';
  private requestedRoomId: string | null = null;
  private dragStart: { x: number; y: number } | null = null;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private panoramaTexture: WebGLTexture | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private loadedPanoramaUrl = '';
  private viewerInitializationStarted = false;

  constructor(private readonly roomService: RoomService, private readonly route: ActivatedRoute) {}

  get has360Panorama(): boolean {
    return !!this.selectedRoom;
  }

  get roomImageUrl(): string {
    if (!this.selectedRoom) return '';
    if (this.activeSceneId === 'bathroom') return '/assets/images/HABITACION_BANO360.png';
    if (this.activeSceneId === 'shower') return '/assets/images/DUCHA360.png';
    if (this.activeSceneId === 'breakfast') return '/assets/images/DESAYUNO360.png';
    if (this.activeSceneId === 'patio') return '/assets/images/PATIO.png';
    const roomPanoramas: Record<Room['type'], string> = {
      Simple: '/assets/images/panorama_habitacion_360_equirectangular.png',
      Doble: '/assets/images/HABITACION%2520DOBLE360.png',
      Matrimonial: '/assets/images/HABITACION%2520MATRIMONIAL360.png',
      Familiar: '/assets/images/HABITACION%2520FAMILIAR360.png'
    };
    return roomPanoramas[this.selectedRoom.type];
  }

  get activeSceneLabel(): string {
    if (this.activeSceneId === 'room') return this.selectedRoom?.name ?? 'Habitación';
    return this.scenes.find((scene) => scene.id === this.activeSceneId)?.label ?? '';
  }

  get fallbackImageUrl(): string {
    return this.selectedRoom ? getRoomImageUrl(this.selectedRoom.type) : '';
  }

  get imageTransform(): string {
    if (this.has360Panorama) return 'none';
    const radians = this.angle * Math.PI / 180;
    const horizontalOffset = Math.sin(radians) * 3;
    const perspectiveRotation = Math.sin(radians) * 2;
    return `translateX(${horizontalOffset}%) scale(1.08) rotateY(${perspectiveRotation}deg)`;
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.gl && this.panoramaTexture) this.gl.deleteTexture(this.panoramaTexture);
    if (this.gl && this.vertexBuffer) this.gl.deleteBuffer(this.vertexBuffer);
    if (this.gl && this.program) this.gl.deleteProgram(this.program);
  }

  get activeHotspotTitle(): string {
    return this.hotspots.find((hotspot) => hotspot.id === this.activeHotspotId)?.label ?? '';
  }

  get activeHotspotDescription(): string {
    if (!this.selectedRoom) return '';
    switch (this.activeHotspotId) {
      case 'bed':
        return this.bedDescription(this.selectedRoom);
      case 'bath':
        return 'El catálogo del hostal indica que esta habitación cuenta con baño privado y agua caliente las 24 horas.';
      case 'patio':
        return 'El hostal cuenta con patio y áreas comunes. La información disponible no confirma que esta habitación tenga una vista directa al patio.';
    }
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.requestedRoomId = params.get('roomId');
      this.selectRequestedRoom();
    });
    this.rooms = this.roomService.getCachedRooms();
    this.selectRequestedRoom();
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = this.rooms.length === 0;
    this.errorMessage = '';
    this.roomsWarning = '';
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
        this.selectRequestedRoom();
      },
      error: () => {
        this.loading = false;
        if (this.rooms.length) {
          this.roomsWarning = 'No pudimos actualizar el catálogo; se muestran las habitaciones guardadas en este navegador.';
        } else {
          this.errorMessage = 'No pudimos cargar las habitaciones. Comprueba tu conexión e inténtalo nuevamente.';
        }
      }
    });
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
    this.activeSceneId = 'room';
    this.angle = 0;
    this.verticalAngle = 0;
    this.activeHotspotId = 'bed';
    if (this.has360Panorama && this.gl) this.loadPanorama();
  }

  selectScene(sceneId: SceneId): void {
    this.activeSceneId = sceneId;
    this.angle = 0;
    this.verticalAngle = 0;
    this.activeHotspotId = 'bed';
    this.loadPanorama();
  }

  openExpandedViewer(): void {
    this.isExpanded = true;
    requestAnimationFrame(() => this.closeButton?.nativeElement.focus());
  }

  closeExpandedViewer(): void {
    this.isExpanded = false;
    requestAnimationFrame(() => this.expandButton?.nativeElement.focus());
  }

  rotate(degrees: number): void {
    this.angle = ((this.angle + degrees) % 360 + 360) % 360;
    if (this.has360Panorama) this.drawPanorama();
  }

  tilt(degrees: number): void {
    this.verticalAngle = Math.max(-60, Math.min(60, this.verticalAngle + degrees));
    if (this.has360Panorama) this.drawPanorama();
  }

  hotspotPosition(hotspot: TourHotspot): { top: string; left: string } {
    if (!this.has360Panorama) return { top: hotspot.top, left: hotspot.left };
    const yawDelta = this.normalizeAngle(hotspot.yaw - this.angle) * Math.PI / 180;
    const pitchDelta = (hotspot.pitch - this.verticalAngle) * Math.PI / 180;
    const horizontal = 50 + Math.tan(yawDelta) * 50;
    const vertical = 50 - Math.tan(pitchDelta) * 50;
    return { top: `${vertical}%`, left: `${horizontal}%` };
  }

  isHotspotVisible(hotspot: TourHotspot): boolean {
    const yawDelta = Math.abs(this.normalizeAngle(hotspot.yaw - this.angle));
    const pitchDelta = Math.abs(hotspot.pitch - this.verticalAngle);
    return yawDelta < 42 && pitchDelta < 38;
  }

  showHotspot(id: HotspotId): void {
    this.activeHotspotId = id;
  }

  startDrag(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    this.dragStart = { x: event.clientX, y: event.clientY };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  endDrag(event: PointerEvent): void {
    if (!this.dragStart) return;
    const deltaX = this.dragStart.x - event.clientX;
    const deltaY = this.dragStart.y - event.clientY;
    this.dragStart = null;
    if (Math.abs(deltaX) >= 4) this.rotate(Math.round(deltaX * 0.5));
    if (this.has360Panorama && Math.abs(deltaY) >= 4) this.tilt(Math.round(deltaY * 0.35));
  }

  cancelDrag(): void {
    this.dragStart = null;
  }

  onViewerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isExpanded) {
      event.preventDefault();
      this.closeExpandedViewer();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.rotate(-20);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.rotate(20);
    } else if (this.has360Panorama && event.key === 'ArrowUp') {
      event.preventDefault();
      this.tilt(10);
    } else if (this.has360Panorama && event.key === 'ArrowDown') {
      event.preventDefault();
      this.tilt(-10);
    }
  }

  private initializePanoramaViewer(): void {
    const canvas = this.panoramaCanvas?.nativeElement;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) {
      this.panoramaError = 'Este navegador no pudo iniciar el visor 360°.';
      return;
    }

    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `);
    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_panorama;
      uniform vec2 u_resolution;
      uniform float u_yaw;
      uniform float u_pitch;
      uniform float u_fov;
      const float PI = 3.14159265358979323846;
      void main() {
        vec2 screen = v_uv * 2.0 - 1.0;
        float focal = tan(u_fov * 0.5);
        float aspect = u_resolution.x / u_resolution.y;
        vec3 ray = normalize(vec3(screen.x * aspect * focal, screen.y * focal, 1.0));
        float cosYaw = cos(u_yaw);
        float sinYaw = sin(u_yaw);
        ray = vec3(ray.x * cosYaw + ray.z * sinYaw, ray.y, -ray.x * sinYaw + ray.z * cosYaw);
        float cosPitch = cos(u_pitch);
        float sinPitch = sin(u_pitch);
        ray = vec3(ray.x, ray.y * cosPitch + ray.z * sinPitch, -ray.y * sinPitch + ray.z * cosPitch);
        float longitude = atan(ray.x, ray.z);
        float latitude = asin(clamp(ray.y, -1.0, 1.0));
        vec2 uv = vec2(longitude / (2.0 * PI) + 0.5, 0.5 + latitude / PI);
        gl_FragColor = texture2D(u_panorama, uv);
      }
    `);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) {
      this.panoramaError = 'No se pudo preparar el visor 360° en este navegador.';
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('No se pudo enlazar el visor WebGL del panorama.', gl.getProgramInfoLog(program));
      this.panoramaError = 'No se pudo preparar el visor 360° en este navegador.';
      gl.deleteProgram(program);
      return;
    }
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const vertexBuffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (positionLocation < 0 || !vertexBuffer || !texture) {
      console.error('No se pudieron crear los recursos gráficos del visor 360°.');
      this.panoramaError = 'No se pudieron preparar los gráficos 360° en este navegador.';
      gl.deleteProgram(program);
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
      if (texture) gl.deleteTexture(texture);
      return;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'u_panorama'), 0);
    gl.uniform1f(gl.getUniformLocation(program, 'u_fov'), Math.PI / 2);

    this.gl = gl;
    this.program = program;
    this.vertexBuffer = vertexBuffer;
    this.panoramaTexture = texture;
    this.resizeObserver = new ResizeObserver(() => this.resizePanorama());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    this.resizePanorama();
    window.requestAnimationFrame(() => this.resizePanorama());
  }

  private createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) {
      this.panoramaError = 'No se pudieron preparar los gráficos 360° en este navegador.';
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('No se pudo compilar el visor WebGL del panorama.', gl.getShaderInfoLog(shader));
      this.panoramaError = 'No se pudo preparar el visor 360° en este navegador.';
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private loadPanorama(): void {
    const url = this.roomImageUrl;
    if (!this.gl || !this.panoramaTexture || !url || this.loadedPanoramaUrl === url) return;
    this.panoramaError = '';
    const image = new Image();
    image.onload = () => {
      if (this.roomImageUrl !== url) return;
      if (!this.gl || !this.panoramaTexture) return;
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.panoramaTexture);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      const uploadError = this.gl.getError();
      if (uploadError !== this.gl.NO_ERROR) {
        console.error('El navegador no pudo subir la textura del panorama 360°.', uploadError);
        this.panoramaError = 'El navegador no pudo preparar la imagen panorámica 360°.';
        return;
      }
      this.loadedPanoramaUrl = url;
      this.resizePanorama();
    };
    image.onerror = (error) => {
      console.error('No se pudo cargar la imagen panorámica 360°.', error);
      this.panoramaError = 'No se pudo cargar la imagen panorámica 360°.';
    };
    image.src = url;
  }

  private resizePanorama(): void {
    const canvas = this.panoramaCanvas?.nativeElement;
    if (!canvas || !this.gl) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    this.drawPanorama();
  }

  private drawPanorama(): void {
    const gl = this.gl;
    const program = this.program;
    const canvas = this.panoramaCanvas?.nativeElement;
    if (!gl || !program || !canvas || !this.loadedPanoramaUrl) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_yaw'), this.angle * Math.PI / 180);
    gl.uniform1f(gl.getUniformLocation(program, 'u_pitch'), this.verticalAngle * Math.PI / 180);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private normalizeAngle(degrees: number): number {
    return ((degrees + 180) % 360 + 360) % 360 - 180;
  }

  private selectRequestedRoom(): void {
    if (!this.rooms.length) return;
    const requestedRoom = this.rooms.find((room) => room._id === this.requestedRoomId);
    const room = requestedRoom ?? this.rooms[0];
    if (this.selectedRoom?._id !== room._id) this.selectRoom(room);
  }

  private bedDescription(room: Room): string {
    const bedDescriptions: Record<Room['type'], string> = {
      Simple: 'El catálogo describe una cama individual. No publica sus medidas exactas; consulta con recepción si necesitas esa información.',
      Doble: 'El catálogo describe dos camas individuales. No publica sus medidas exactas; consulta con recepción si necesitas esa información.',
      Matrimonial: 'El catálogo describe una cama doble. No publica sus medidas exactas; consulta con recepción si necesitas esa información.',
      Familiar: `Habitación para hasta ${room.capacity} personas. El catálogo no especifica la distribución ni las medidas de las camas; consulta con recepción.`
    };
    return bedDescriptions[room.type];
  }
}
