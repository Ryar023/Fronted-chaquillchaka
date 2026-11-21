import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="chatbox" (keydown.escape)="closeChat()">
      <div *ngIf="isOpen" id="chat-panel" class="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title">
        <header class="chat-header">
          <div class="chat-heading">
            <span class="chat-avatar" aria-hidden="true">C</span>
            <div>
              <h2 id="chat-title">Atención Chaquill Chak'a</h2>
              <p>Estamos aquí para ayudarte</p>
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
            <h3>¡Hola! ¿En qué podemos ayudarte?</h3>
            <p>Escríbenos sobre habitaciones, reservas o tu visita a Cusco.</p>
          </div>
          <div
            *ngFor="let message of messages"
            class="message-row"
            [class.user-row]="message.role === 'user'"
            [class.bot-row]="message.role === 'assistant'">
            <div class="message-bubble" [class.user-message]="message.role === 'user'" [class.bot-message]="message.role === 'assistant'">
              {{ message.content }}
              <span *ngIf="message.failed" class="failed-message">No se envió. Puedes volver a intentarlo.</span>
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

        <form class="chat-composer" (ngSubmit)="sendMessage()">
          <label class="sr-only" for="chat-message-input">Escribe tu mensaje</label>
          <input
            #messageInput
            id="chat-message-input"
            type="text"
            autocomplete="off"
            placeholder="Escribe tu mensaje…"
            [value]="draft"
            [disabled]="isSending || !sessionId"
            (input)="updateDraft($event)">
          <button type="submit" class="send-button" aria-label="Enviar mensaje" [disabled]="!draft.trim() || isSending || !sessionId">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 12 20 4l-5 16-3-7-8-1Zm8 1 4-5"/></svg>
          </button>
        </form>
        <p class="chat-footnote">Las respuestas se guardan para esta conversación.</p>
      </div>

      <button
        #toggleButton
        type="button"
        class="chat-toggle"
        [attr.aria-expanded]="isOpen"
        aria-controls="chat-panel"
        [attr.aria-label]="isOpen ? 'Cerrar chat de atención' : 'Abrir chat de atención'"
        (click)="toggleChat()">
        <svg *ngIf="!isOpen" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.1-.62L4 20l1.57-4.1A7.47 7.47 0 0 1 5 12a7.5 7.5 0 0 1 15-.5Z"/><path d="M8 11h8M8 14h5"/></svg>
        <svg *ngIf="isOpen" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </section>
  `,
  styles: [`
    :host { position:relative; z-index:31; }
    .chatbox { position:fixed; right:22px; bottom:150px; z-index:31; }
    .chat-toggle { display:grid; width:60px; height:60px; place-items:center; border:2px solid #fff; border-radius:50%; background:var(--forest,#183b32); color:#fff; box-shadow:0 6px 22px #15291f45; cursor:pointer; transition:transform .18s ease,background .18s ease; }
    .chat-toggle:hover { transform:translateY(-2px); background:#245447; }
    .chat-toggle svg { width:27px; height:27px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    .chat-panel { position:absolute; right:0; bottom:calc(100% + 14px); display:flex; width:min(390px,calc(100vw - 28px)); height:min(590px,calc(100dvh - 230px)); min-height:340px; flex-direction:column; overflow:hidden; border:1px solid #dfe5dc; border-radius:16px; background:#fff; box-shadow:0 18px 55px #14231f30; }
    .chat-header { display:flex; min-height:76px; align-items:center; justify-content:space-between; gap:10px; background:var(--forest,#183b32); padding:12px 14px; color:#fff; }
    .chat-heading { display:flex; min-width:0; align-items:center; gap:10px; }
    .chat-avatar { display:grid; width:40px; height:40px; flex:none; place-items:center; border:1px solid #ffffff80; border-radius:50%; background:#ffffff1a; font-family:Georgia,serif; font-size:21px; }
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
    .message-bubble { max-width:84%; border-radius:14px; padding:10px 12px; font-size:13px; line-height:1.5; overflow-wrap:anywhere; white-space:pre-wrap; }
    .user-message { border-bottom-right-radius:4px; background:#183b32; color:#fff; }
    .bot-message { border-bottom-left-radius:4px; background:#fff; color:#26362e; box-shadow:0 1px 3px #15291f12; }
    .failed-message { display:block; margin-top:5px; color:#ffd2c9; font-size:11px; }
    .chat-error { margin:0; border-top:1px solid #f1d2cc; background:#fff5f3; padding:8px 14px; color:#8c1d18; font-size:12px; line-height:1.4; }
    .typing-indicator { display:flex; min-width:56px; align-items:center; gap:4px; padding:14px 13px; }
    .typing-indicator > span:not(.sr-only) { width:6px; height:6px; border-radius:50%; background:#78837c; animation:typing-bounce 1.1s infinite ease-in-out; }
    .typing-indicator > span:nth-child(2) { animation-delay:.15s; }
    .typing-indicator > span:nth-child(3) { animation-delay:.3s; }
    .chat-composer { display:flex; align-items:center; gap:8px; border-top:1px solid #e8ebe6; padding:10px 12px; }
    .chat-composer input { width:100%; min-width:0; min-height:44px; border:1px solid #d4d9d3; border-radius:22px; background:#fff; padding:0 14px; color:#17221f; font-size:13px; outline:none; }
    .chat-composer input:focus { border-color:#183b32; box-shadow:0 0 0 2px #183b3220; }
    .chat-composer input:disabled { background:#f3f5f2; }
    .send-button { display:grid; width:44px; min-width:44px; height:44px; min-height:44px; place-items:center; border:0; border-radius:50%; background:#183b32; color:#fff; cursor:pointer; }
    .send-button:hover { background:#245447; }
    .send-button:disabled { background:#b9c3bc; cursor:not-allowed; }
    .send-button svg { width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    .chat-footnote { margin:0; padding:0 12px 9px; color:#68716b; font-size:10px; text-align:center; }
    .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    @keyframes typing-bounce { 0%,60%,100% { transform:translateY(0); opacity:.55; } 30% { transform:translateY(-4px); opacity:1; } }
    @media(max-width:767px) {
      .chatbox { right:14px; bottom:calc(146px + env(safe-area-inset-bottom)); }
      .chat-panel { height:min(590px,calc(100dvh - 228px - env(safe-area-inset-bottom))); }
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
export class ChatboxComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLElement>;
  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLInputElement>;
  @ViewChild('toggleButton') private toggleButton?: ElementRef<HTMLButtonElement>;

  isOpen = false;
  isSending = false;
  isLoadingHistory = false;
  sessionId = '';
  draft = '';
  errorMessage = '';
  messages: ChatMessage[] = [];
  private shouldScrollToBottom = false;
  private historyRequestId = 0;

  constructor(private readonly chatService: ChatService, private readonly changeDetector: ChangeDetectorRef) {}

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
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      requestAnimationFrame(() => this.messageInput?.nativeElement.focus());
    }
  }

  closeChat(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    requestAnimationFrame(() => this.toggleButton?.nativeElement.focus());
  }

  updateDraft(event: Event): void {
    this.draft = (event.target as HTMLInputElement).value;
  }

  sendMessage(): void {
    const content = this.draft.trim();
    if (!content || this.isSending || !this.sessionId) return;

    this.draft = content;
    this.errorMessage = '';
    const previousMessage = this.messages[this.messages.length - 1];
    if (previousMessage?.role === 'user' && previousMessage.failed && previousMessage.content === content) {
      previousMessage.failed = false;
    } else {
      this.messages.push({ role: 'user', content });
    }
    this.isSending = true;
    this.shouldScrollToBottom = true;
    this.changeDetector.detectChanges();

    this.chatService.sendMessage(this.sessionId, content).subscribe({
      next: (reply) => {
        this.messages.push({ role: 'assistant', content: reply });
        this.draft = '';
        this.isSending = false;
        this.shouldScrollToBottom = true;
      },
      error: (error: unknown) => {
        console.error('No se pudo enviar el mensaje al chat.', error);
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage?.role === 'user' && lastMessage.content === content) lastMessage.failed = true;
        this.draft = content;
        this.isSending = false;
        this.errorMessage = 'No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo de nuevo.';
        this.shouldScrollToBottom = true;
      }
    });
  }

  startNewConversation(): void {
    try {
      this.sessionId = this.chatService.startNewSession();
      this.messages = [];
      this.draft = '';
      this.errorMessage = '';
      this.loadHistory();
    } catch {
      this.errorMessage = 'No se pudo iniciar una nueva conversación en este navegador.';
    }
  }

  private loadHistory(): void {
    const requestId = ++this.historyRequestId;
    this.isLoadingHistory = true;
    this.errorMessage = '';
    this.chatService.getHistory(this.sessionId).subscribe({
      next: (messages) => {
        if (requestId !== this.historyRequestId) return;
        this.messages = messages;
        this.isLoadingHistory = false;
        this.shouldScrollToBottom = true;
      },
      error: (error: unknown) => {
        if (requestId !== this.historyRequestId) return;
        console.error('No se pudo cargar el historial del chat.', error);
        this.isLoadingHistory = false;
        this.errorMessage = 'No pudimos cargar el historial. Puedes enviar un mensaje para continuar.';
      }
    });
  }
}
