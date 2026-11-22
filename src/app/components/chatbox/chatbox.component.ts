import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatMessage, ChatService } from '../../services/chat.service';
import { Room } from '../../models/room.interface';
import { getRoomImageUrl } from '../../models/room-image';
import { RoomService } from '../../services/room.service';

interface ChatTextPart {
  text: string;
  bold: boolean;
}

interface DisplayChatMessage extends ChatMessage {
  parts: ChatTextPart[];
  roomTypes: Room['type'][];
}

interface RecognitionResultEvent extends Event {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

interface RecognitionErrorEvent extends Event {
  error: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionConstructor = new () => BrowserSpeechRecognition;

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="chatbox" (keydown.escape)="closeChat()">
      <div *ngIf="isOpen" id="chat-panel" class="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title">
        <header class="chat-header">
          <div class="chat-heading">
            <span class="chat-avatar" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v3m-2-3h4M5 9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9Zm-2 2v3m18-3v3M9 11h.01M15 11h.01M9 15c2 1.5 4 1.5 6 0"/></svg></span>
            <div>
              <h2 id="chat-title">Asistente Chaquill Chak'a</h2>
              <p>Tu ayuda para conocer el hostal</p>
            </div>
          </div>
          <div class="header-actions">
            <button type="button" class="header-button new-chat-button" (click)="startNewConversation()" [disabled]="isSending || isLoadingHistory">
              Nueva conversación
            </button>
            <button type="button" class="header-button close-button" aria-label="Cerrar chat" (click)="closeChat()">×</button>
          </div>
        </header>

        <div #messagesContainer class="messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Mensajes de la conversación">
          <div *ngIf="isLoadingHistory" class="conversation-status" role="status">Cargando conversación…</div>
          <div *ngIf="!isLoadingHistory && messages.length === 0" class="welcome-message">
            <span class="welcome-icon" aria-hidden="true">✦</span>
            <h3>¡Bienvenido al chat!</h3>
            <p>¿En qué podemos ayudarte? Pregúntanos por voz o por escrito sobre habitaciones, reservas y tu visita a Cusco.</p>
          </div>
          <div
            *ngFor="let message of messages"
            class="message-row"
            [class.user-row]="message.role === 'user'"
            [class.bot-row]="message.role === 'assistant'">
            <div class="message-content">
              <div class="message-bubble" [class.user-message]="message.role === 'user'" [class.bot-message]="message.role === 'assistant'">
                <ng-container *ngFor="let part of message.parts"><strong *ngIf="part.bold">{{ part.text }}</strong><ng-container *ngIf="!part.bold">{{ part.text }}</ng-container></ng-container>
                <span *ngIf="message.failed" class="failed-message">No se pudo confirmar la respuesta.</span>
              </div>
              <button *ngIf="message.role === 'assistant' && speechSupported" type="button" class="listen-button" [disabled]="isListening" (click)="toggleSpeech(message)">
                {{ speakingMessage === message ? '■ Detener audio' : '▶ Escuchar respuesta' }}
              </button>
              <div *ngIf="message.roomTypes.length" class="room-suggestions">
                <p class="room-suggestions-label">Habitaciones mencionadas</p>
                <article *ngFor="let type of message.roomTypes" class="chat-room-card">
                  <a class="chat-room-image-link" routerLink="/habitaciones" (click)="closeChat()" [attr.aria-label]="'Ver habitaciones: ' + type">
                    <img [src]="roomImageUrl(type)" [alt]="'Habitación ' + type" loading="lazy" (load)="onRoomImageLoad()" (error)="onRoomImageError($event)">
                    <span>Ver habitaciones <span aria-hidden="true">↗</span></span>
                  </a>
                  <div class="chat-room-details">
                    <strong>Habitación {{ type }}</strong>
                    <ng-container *ngIf="findRoom(type) as room">
                      <p>Hasta {{ room.capacity }} {{ room.capacity === 1 ? 'persona' : 'personas' }} · Desde S/ {{ room.pricePen | number:'1.0-0' }} / noche</p>
                      <div class="chat-room-actions">
                        <a [routerLink]="['/tour-ar']" [queryParams]="{ roomId: room._id }" (click)="closeChat()">Tour 360°</a>
                        <a [routerLink]="['/reserva']" [queryParams]="{ roomId: room._id }" data-direct-booking-navigation (click)="closeChat()">Reservar</a>
                      </div>
                    </ng-container>
                    <p *ngIf="catalogError && !findRoom(type)" class="room-catalog-warning">Consulta los detalles en Habitaciones.</p>
                  </div>
                </article>
              </div>
            </div>
          </div>
          <div *ngIf="isSending" class="message-row bot-row" role="status" aria-label="El asistente está escribiendo">
            <div class="message-bubble bot-message typing-indicator">
              <span></span><span></span><span></span>
              <span class="sr-only">Escribiendo…</span>
            </div>
          </div>
        </div>

        <p *ngIf="errorMessage" class="chat-error" role="alert">{{ errorMessage }}</p>
        <p *ngIf="isSending && isTakingLong" class="voice-status" role="status">La respuesta está tardando más de lo habitual. Seguimos esperando; evita enviar el mensaje otra vez.</p>
        <p *ngIf="voiceMessage" class="voice-status" role="status">{{ voiceMessage }}</p>

        <form class="chat-composer" (submit)="$event.preventDefault(); sendMessage()">
          <label class="sr-only" for="chat-message-input">Escribe tu mensaje</label>
          <input
            #messageInput
            id="chat-message-input"
            type="text"
            autocomplete="off"
            placeholder="Escribe tu mensaje…"
            [value]="draft"
            [disabled]="isSending || isLoadingHistory || isListening || !sessionId"
            (input)="updateDraft($event)">
          <button type="button" class="mic-button" [class.listening]="isListening" [disabled]="isSending || isLoadingHistory || isStopping || !sessionId || !recognitionSupported" [attr.aria-pressed]="isListening" [attr.aria-label]="isListening ? 'Terminar de hablar y enviar' : 'Hablar con el asistente'" (click)="toggleRecognition()">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3m-3 0h6"/></svg>
          </button>
          <button type="submit" class="send-button" aria-label="Enviar mensaje" [disabled]="!draft.trim() || isSending || isLoadingHistory || isListening || !sessionId">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 12 20 4l-5 16-3-7-8-1Zm8 1 4-5"/></svg>
          </button>
        </form>
        <p class="chat-footnote" *ngIf="recognitionSupported">La voz se procesa mediante el navegador y se envía al terminar de hablar.</p>
        <p class="chat-footnote" *ngIf="!recognitionSupported">El micrófono no está disponible en este navegador; puedes escribir.</p>
      </div>

      <button
        #toggleButton
        type="button"
        class="chat-toggle"
        [attr.aria-expanded]="isOpen"
        aria-controls="chat-panel"
        [attr.aria-label]="isOpen ? 'Cerrar chat de atención' : 'Abrir chat de atención'"
        [attr.title]="isOpen ? 'Cerrar chat' : 'Abrir chat'"
        (click)="toggleChat()">
        <svg *ngIf="!isOpen" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.1-.62L4 20l1.57-4.1A7.47 7.47 0 0 1 5 12a7.5 7.5 0 0 1 15-.5Z"/><path d="M8 11h8M8 14h5"/></svg>
        <svg *ngIf="isOpen" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </section>
  `,
  styles: [`
    :host { position:relative; z-index:31; }
    .chatbox { position:fixed; right:88px; bottom:16px; z-index:31; }
    .chat-toggle { display:grid; width:56px; height:56px; place-items:center; border:2px solid #fff; border-radius:50%; background:var(--forest,#183b32); color:#fff; box-shadow:0 6px 22px #15291f45; cursor:pointer; transition:transform .18s ease,background .18s ease; }
    .chat-toggle:hover { transform:translateY(-2px); background:#245447; }
    .chat-toggle svg { width:27px; height:27px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    .chat-panel { position:absolute; right:-72px; bottom:calc(100% + 14px); display:flex; width:min(390px,calc(100vw - 28px)); height:min(590px,calc(100dvh - 102px)); flex-direction:column; overflow:hidden; border:1px solid #dfe5dc; border-radius:16px; background:#fff; box-shadow:0 18px 55px #14231f30; }
    .chat-header { display:flex; min-height:76px; align-items:center; justify-content:space-between; gap:10px; background:var(--forest,#183b32); padding:12px 14px; color:#fff; }
    .chat-heading { display:flex; min-width:0; align-items:center; gap:10px; }
    .chat-avatar { display:grid; width:40px; height:40px; flex:none; place-items:center; border:1px solid #ffffff80; border-radius:50%; background:#ffffff1a; }
    .chat-avatar svg { width:25px; height:25px; fill:none; stroke:currentColor; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
    .chat-heading h2 { margin:0; font-size:14px; font-weight:750; line-height:1.3; }
    .chat-heading p { margin:3px 0 0; color:#e3ebe5; font-size:11px; }
    .header-actions { display:flex; flex:none; align-items:center; gap:6px; }
    .header-button { display:grid; min-width:0; min-height:36px; place-items:center; border:1px solid #ffffff75; border-radius:6px; background:transparent; padding:6px 8px; color:#fff; font-size:11px; font-weight:650; cursor:pointer; }
    .header-button:hover { background:#ffffff1a; }
    .header-button:disabled { cursor:not-allowed; opacity:.55; }
    .close-button { width:36px; padding:0; font-size:23px; line-height:1; }
    .messages { display:flex; flex:1; flex-direction:column; gap:12px; overflow-y:auto; overscroll-behavior:contain; padding:18px 14px; background:#f7f8f5; }
    .conversation-status { margin:auto; color:#59635d; font-size:13px; }
    .welcome-message { max-width:280px; margin:auto; text-align:center; }
    .welcome-icon { display:grid; width:44px; height:44px; margin:0 auto 12px; place-items:center; border-radius:50%; background:#e9f0e9; color:#183b32; font-size:22px; }
    .welcome-message h3 { margin:0 0 7px; color:#183b32; font-family:Georgia,"Times New Roman",serif; font-size:19px; font-weight:500; }
    .welcome-message p { margin:0; color:#59635d; font-size:13px; line-height:1.5; }
    .message-row { display:flex; width:100%; }
    .user-row { justify-content:flex-end; }
    .bot-row { justify-content:flex-start; }
    .message-content { max-width:90%; min-width:0; }
    .message-bubble { border-radius:14px; padding:10px 12px; font-size:13px; line-height:1.55; overflow-wrap:anywhere; white-space:pre-wrap; }
    .user-message { border-bottom-right-radius:4px; background:#183b32; color:#fff; }
    .bot-message { border-bottom-left-radius:4px; background:#fff; color:#26362e; box-shadow:0 1px 3px #15291f12; }
    .listen-button { min-width:0; min-height:40px; margin-top:5px; border:0; border-radius:5px; background:transparent; padding:6px; color:#315342; font-size:12px; font-weight:700; cursor:pointer; }
    .listen-button:hover { background:#e9f0e9; }
    .listen-button:disabled { opacity:.5; cursor:not-allowed; }
    .room-suggestions { display:grid; gap:9px; margin-top:10px; }
    .room-suggestions-label { margin:0; color:#59635d; font-size:11px; font-weight:700; }
    .chat-room-card { overflow:hidden; border:1px solid #e0e6df; border-radius:10px; background:#fff; box-shadow:0 2px 8px #15291f0d; }
    .chat-room-image-link { position:relative; display:block; height:130px; overflow:hidden; background:#e9ede8; }
    .chat-room-image-link img { display:block; width:100%; height:100%; object-fit:cover; }
    .chat-room-image-link > span { position:absolute; right:8px; bottom:8px; border-radius:5px; background:#17221fe8; padding:5px 8px; color:#fff; font-size:11px; font-weight:700; }
    .chat-room-details { padding:10px 12px; color:#183b32; font-size:13px; }
    .chat-room-details p { margin:4px 0 0; color:#59635d; font-size:11px; line-height:1.5; }
    .chat-room-actions { display:flex; flex-wrap:wrap; gap:7px; margin-top:9px; }
    .chat-room-actions a { display:inline-flex; min-height:40px; align-items:center; justify-content:center; flex:1; border:1px solid #183b32; border-radius:5px; padding:7px 9px; color:#183b32; font-size:12px; font-weight:700; text-decoration:none; }
    .chat-room-actions a:last-child { background:#183b32; color:#fff; }
    .chat-room-actions a:hover { text-decoration:underline; }
    .failed-message { display:block; margin-top:5px; color:#ffd2c9; font-size:11px; }
    .chat-error { margin:0; border-top:1px solid #f1d2cc; background:#fff5f3; padding:8px 14px; color:#8c1d18; font-size:12px; line-height:1.4; }
    .voice-status { margin:0; padding:7px 14px; background:#edf3ed; color:#183b32; font-size:12px; line-height:1.4; }
    .typing-indicator { display:flex; min-width:56px; align-items:center; gap:4px; padding:14px 13px; }
    .typing-indicator > span:not(.sr-only) { width:6px; height:6px; border-radius:50%; background:#78837c; animation:typing-bounce 1.1s infinite ease-in-out; }
    .typing-indicator > span:nth-child(2) { animation-delay:.15s; }
    .typing-indicator > span:nth-child(3) { animation-delay:.3s; }
    .chat-composer { display:flex; align-items:center; gap:8px; border-top:1px solid #e8ebe6; padding:10px 12px; }
    .chat-composer input { width:100%; min-width:0; min-height:44px; border:1px solid #d4d9d3; border-radius:22px; background:#fff; padding:0 14px; color:#17221f; font-size:13px; outline:none; }
    .chat-composer input:focus { border-color:#183b32; box-shadow:0 0 0 2px #183b3220; }
    .chat-composer input:disabled { background:#f3f5f2; }
    .mic-button { display:grid; width:44px; min-width:44px; height:44px; min-height:44px; place-items:center; border:1px solid #c8d3ca; border-radius:50%; background:#f0f5f0; color:#183b32; cursor:pointer; }
    .mic-button.listening { background:#a12e21; border-color:#a12e21; color:#fff; }
    .mic-button:disabled { opacity:.45; cursor:not-allowed; }
    .mic-button svg { width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    .send-button { display:grid; width:44px; min-width:44px; height:44px; min-height:44px; place-items:center; border:0; border-radius:50%; background:#183b32; color:#fff; cursor:pointer; }
    .send-button:hover { background:#245447; }
    .send-button:disabled { background:#b9c3bc; cursor:not-allowed; }
    .send-button svg { width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    .chat-footnote { margin:0; padding:0 12px 9px; color:#68716b; font-size:10px; text-align:center; }
    .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    @keyframes typing-bounce { 0%,60%,100% { transform:translateY(0); opacity:.55; } 30% { transform:translateY(-4px); opacity:1; } }
    @media(max-width:767px) {
      .chatbox { right:14px; bottom:calc(82px + env(safe-area-inset-bottom)); }
      .chat-panel { right:0; width:min(390px,calc(100vw - 44px)); height:min(590px,calc(100dvh - 168px - env(safe-area-inset-bottom))); }
    }
    @media(max-width:370px) {
      .chat-header { padding-inline:10px; }
      .chat-heading { gap:7px; }
      .chat-avatar { width:34px; height:34px; }
      .chat-heading h2 { font-size:12px; }
      .new-chat-button { max-width:86px; font-size:10px; line-height:1.2; }
    }
    @media(prefers-reduced-motion:reduce) {
      .chat-toggle { transition:none; }
      .typing-indicator > span:not(.sr-only) { animation:none; }
    }
  `]
})
export class ChatboxComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLElement>;
  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLInputElement>;
  @ViewChild('toggleButton') private toggleButton?: ElementRef<HTMLButtonElement>;

  isOpen = false;
  isSending = false;
  isTakingLong = false;
  isLoadingHistory = false;
  sessionId = '';
  draft = '';
  errorMessage = '';
  messages: DisplayChatMessage[] = [];
  rooms: Room[] = [];
  catalogError = false;
  readonly recognitionConstructor: RecognitionConstructor | undefined = this.getRecognitionConstructor();
  readonly recognitionSupported = !!this.recognitionConstructor && window.isSecureContext;
  readonly speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  isListening = false;
  isStopping = false;
  voiceMessage = '';
  speakingMessage: DisplayChatMessage | null = null;
  private recognition: BrowserSpeechRecognition | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private catalogRequested = false;
  private shouldScrollToBottom = false;
  private historyRequestId = 0;
  private slowResponseTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    try {
      this.sessionId = this.chatService.getOrCreateSessionId();
      this.loadHistory();
    } catch {
      this.errorMessage = 'No se pudo guardar la sesión del chat en este navegador.';
    }
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom || !this.messagesContainer) return;
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    this.shouldScrollToBottom = false;
  }

  toggleChat(): void {
    if (this.isOpen) {
      this.closeChat();
      return;
    }
    this.isOpen = true;
    this.loadRoomCatalog();
    requestAnimationFrame(() => this.messageInput?.nativeElement.focus());
    this.shouldScrollToBottom = true;
  }

  closeChat(): void {
    if (!this.isOpen) return;
    this.cancelRecognition();
    this.stopSpeech();
    this.isOpen = false;
    requestAnimationFrame(() => this.toggleButton?.nativeElement.focus());
  }

  updateDraft(event: Event): void {
    this.draft = (event.target as HTMLInputElement).value;
  }

  sendMessage(): void {
    const content = this.draft.trim();
    if (!content || this.isSending || this.isLoadingHistory || this.isListening || !this.sessionId) return;

    this.draft = content;
    this.errorMessage = '';
    const previousMessage = this.messages[this.messages.length - 1];
    if (previousMessage?.role === 'user' && previousMessage.failed && previousMessage.content === content) {
      previousMessage.failed = false;
    } else {
      this.messages.push(this.toDisplayMessage({ role: 'user', content }));
    }
    this.isSending = true;
    this.isTakingLong = false;
    this.slowResponseTimer = setTimeout(() => {
      this.isTakingLong = true;
      this.changeDetector.markForCheck();
    }, 12000);
    this.shouldScrollToBottom = true;

    this.chatService.sendMessage(this.sessionId, content).subscribe({
      next: (reply) => {
        this.clearSlowResponseTimer();
        this.messages.push(this.toDisplayMessage({ role: 'assistant', content: reply }));
        this.draft = '';
        this.isSending = false;
        this.shouldScrollToBottom = true;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.clearSlowResponseTimer();
        console.error('No se pudo enviar el mensaje al chat.', error);
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage?.role === 'user' && lastMessage.content === content) lastMessage.failed = true;
        this.draft = content;
        this.isSending = false;
        this.errorMessage = 'No recibimos confirmación. Revisa tu conexión y recarga para comprobar el historial antes de enviar el mensaje otra vez.';
        this.shouldScrollToBottom = true;
        this.changeDetector.markForCheck();
      }
    });
  }

  startNewConversation(): void {
    try {
      this.cancelRecognition();
      this.stopSpeech();
      this.sessionId = this.chatService.startNewSession();
      this.messages = [];
      this.draft = '';
      this.errorMessage = '';
      this.loadHistory();
    } catch {
      this.errorMessage = 'No se pudo iniciar una nueva conversación en este navegador.';
    }
  }

  ngOnDestroy(): void {
    this.clearSlowResponseTimer();
    this.cancelRecognition();
    this.stopSpeech();
  }

  private clearSlowResponseTimer(): void {
    if (this.slowResponseTimer !== null) clearTimeout(this.slowResponseTimer);
    this.slowResponseTimer = null;
    this.isTakingLong = false;
  }

  toggleRecognition(): void {
    if (this.recognition) {
      this.voiceMessage = 'Terminando de escuchar…';
      this.isStopping = true;
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('No se pudo detener el reconocimiento de voz.', error);
        this.cancelRecognition();
        this.voiceMessage = 'No se pudo terminar de escuchar. Vuelve a intentarlo.';
      }
      return;
    }
    if (!this.recognitionSupported || !this.recognitionConstructor || this.isSending || this.isLoadingHistory || !this.sessionId) return;
    if (this.draft.trim()) {
      this.voiceMessage = 'Envía o borra el mensaje escrito antes de usar el micrófono.';
      return;
    }

    this.stopSpeech();
    const recognition = new this.recognitionConstructor();
    let transcript = '';
    let recognitionFailed = false;
    recognition.lang = 'es-PE';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index];
        if (result.isFinal) transcript += `${result[0].transcript} `;
      }
    };
    recognition.onerror = (event) => {
      if (this.recognition !== recognition) return;
      recognitionFailed = true;
      console.error('No se pudo reconocer la voz del chat.', event.error);
      this.voiceMessage = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'No se permitió usar el micrófono. Revisa los permisos del navegador.'
        : 'No se pudo reconocer la voz. Comprueba tu micrófono y vuelve a intentarlo.';
      this.changeDetector.markForCheck();
    };
    recognition.onend = () => {
      if (this.recognition !== recognition) return;
      this.recognition = null;
      this.isListening = false;
      this.isStopping = false;
      if (!recognitionFailed && transcript.trim()) {
        this.draft = transcript.trim();
        this.voiceMessage = '';
        this.sendMessage();
      } else if (!recognitionFailed) {
        this.voiceMessage = 'No escuchamos ningún mensaje. Pulsa el micrófono para intentarlo de nuevo.';
      }
      this.changeDetector.markForCheck();
    };
    this.recognition = recognition;
    this.isListening = true;
    this.voiceMessage = 'Escuchando… El mensaje se enviará al terminar de hablar.';
    try {
      recognition.start();
    } catch (error) {
      console.error('No se pudo activar el reconocimiento de voz.', error);
      this.recognition = null;
      this.isListening = false;
      this.isStopping = false;
      this.voiceMessage = 'No se pudo activar el micrófono. Vuelve a intentarlo o escribe tu mensaje.';
    }
  }

  toggleSpeech(message: DisplayChatMessage): void {
    if (!this.speechSupported) return;
    if (this.speakingMessage === message) {
      this.stopSpeech();
      return;
    }
    this.stopSpeech();
    const utterance = new SpeechSynthesisUtterance(message.parts.map((part) => part.text).join(''));
    utterance.lang = 'es-PE';
    this.utterance = utterance;
    this.speakingMessage = message;
    utterance.onend = () => {
      if (this.utterance !== utterance) return;
      this.utterance = null;
      this.speakingMessage = null;
      this.changeDetector.markForCheck();
    };
    utterance.onerror = (event) => {
      if (this.utterance !== utterance) return;
      this.utterance = null;
      this.speakingMessage = null;
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.error('No se pudo reproducir la respuesta del chat.', event.error);
        this.voiceMessage = 'No se pudo reproducir la respuesta. Revisa el audio del dispositivo.';
      }
      this.changeDetector.markForCheck();
    };
    window.speechSynthesis.speak(utterance);
  }

  private getRecognitionConstructor(): RecognitionConstructor | undefined {
    if (typeof window === 'undefined') return undefined;
    const browser = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    return browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
  }

  private cancelRecognition(): void {
    if (!this.recognition) return;
    const recognition = this.recognition;
    this.recognition = null;
    this.isListening = false;
    this.isStopping = false;
    this.voiceMessage = '';
    recognition.abort();
  }

  private stopSpeech(): void {
    if (!this.utterance) return;
    this.utterance = null;
    this.speakingMessage = null;
    window.speechSynthesis.cancel();
  }

  private loadHistory(): void {
    const requestId = ++this.historyRequestId;
    this.isLoadingHistory = true;
    this.errorMessage = '';
    this.chatService.getHistory(this.sessionId).subscribe({
      next: (messages) => {
        if (requestId !== this.historyRequestId) return;
        this.messages = messages.map((message) => this.toDisplayMessage(message));
        this.isLoadingHistory = false;
        this.shouldScrollToBottom = true;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        if (requestId !== this.historyRequestId) return;
        console.error('No se pudo cargar el historial del chat.', error);
        this.isLoadingHistory = false;
        this.errorMessage = 'No pudimos cargar el historial. Puedes enviar un mensaje para continuar.';
        this.changeDetector.markForCheck();
      }
    });
  }

  readonly roomImageUrl = getRoomImageUrl;

  findRoom(type: Room['type']): Room | undefined {
    return this.rooms.find((room) => room.type === type);
  }

  onRoomImageLoad(): void {
    this.shouldScrollToBottom = true;
    this.changeDetector.markForCheck();
  }

  onRoomImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.dataset['fallbackAttempted']) {
      console.warn('No se pudo cargar la foto de la habitación del chat.', image.src);
      image.dataset['fallbackAttempted'] = 'true';
      image.src = '/assets/images/slide_habitacion.jpg';
    } else {
      console.error('No se pudo cargar la foto alternativa de la habitación del chat.');
    }
  }

  private loadRoomCatalog(): void {
    if (this.catalogRequested) return;
    this.catalogRequested = true;
    this.rooms = this.roomService.getCachedRooms();
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.catalogError = false;
        this.shouldScrollToBottom = true;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        console.warn('No se pudo actualizar el catálogo de habitaciones del chat.', error);
        this.catalogError = true;
        this.catalogRequested = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  private toDisplayMessage(message: ChatMessage): DisplayChatMessage {
    const parts = message.role === 'assistant'
      ? message.content.split(/(\*\*[^*\n]+\*\*)/g).filter(Boolean).map((part) => {
        const bold = part.startsWith('**') && part.endsWith('**');
        return { text: bold ? part.slice(2, -2) : part, bold };
      })
      : [{ text: message.content, bold: false }];
    const roomTypes: Room['type'][] = [];
    if (message.role === 'assistant') {
      const matches = message.content.matchAll(/\bhabitaci[oó]n(?:es)?\s+(simple|doble|matrimonial|familiar)\b/gi);
      const types: Record<string, Room['type']> = {
        simple: 'Simple', doble: 'Doble', matrimonial: 'Matrimonial', familiar: 'Familiar'
      };
      for (const match of matches) {
        const type = types[match[1].toLowerCase()];
        if (type && !roomTypes.includes(type)) roomTypes.push(type);
      }
    }
    return { ...message, parts, roomTypes };
  }
}
