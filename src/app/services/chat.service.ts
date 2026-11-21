import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  failed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly chatUrl = this.getChatUrl();
  private readonly sessionStorageKey = 'chaquill-chaka.chat-session-id';

  constructor(private readonly http: HttpClient) {}

  getOrCreateSessionId(): string {
    try {
      const currentSessionId = localStorage.getItem(this.sessionStorageKey);
      if (currentSessionId) return currentSessionId;

      const sessionId = this.createSessionId();
      localStorage.setItem(this.sessionStorageKey, sessionId);
      return sessionId;
    } catch (error) {
      console.error('No se pudo guardar la sesión del chat en este navegador.', error);
      throw new Error('No se pudo guardar la sesión del chat en este navegador.');
    }
  }

  startNewSession(): string {
    try {
      const sessionId = this.createSessionId();
      localStorage.setItem(this.sessionStorageKey, sessionId);
      return sessionId;
    } catch (error) {
      console.error('No se pudo iniciar una nueva sesión de chat.', error);
      throw new Error('No se pudo iniciar una nueva sesión de chat.');
    }
  }

  getHistory(sessionId: string): Observable<ChatMessage[]> {
    return this.http.get<unknown>(`${this.chatUrl}/${encodeURIComponent(sessionId)}`)
      .pipe(map((response) => this.parseHistory(response)));
  }

  sendMessage(sessionId: string, message: string): Observable<string> {
    return this.http.post<unknown>(this.chatUrl, { sessionId, message })
      .pipe(map((response) => this.parseReply(response)));
  }

  private createSessionId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
      throw new Error('Este navegador no permite generar un identificador seguro para el chat.');
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  private getChatUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
      return '/api/chat';
    }
    return `${environment.apiUrl}/chat`;
  }

  private parseHistory(response: unknown): ChatMessage[] {
    const payload = this.isRecord(response) && 'data' in response ? response['data'] : response;
    const history = this.getHistoryArray(payload);
    return history.flatMap((entry) => this.parseHistoryEntry(entry));
  }

  private getHistoryArray(payload: unknown): unknown[] {
    if (Array.isArray(payload)) return payload;
    if (!this.isRecord(payload)) {
      throw new Error('El historial del chat tiene un formato inesperado.');
    }

    for (const key of ['messages', 'history']) {
      const value = payload[key];
      if (Array.isArray(value)) return value;
    }

    throw new Error('El historial del chat no contiene una lista de mensajes.');
  }

  private parseHistoryEntry(entry: unknown): ChatMessage[] {
    if (!this.isRecord(entry)) {
      throw new Error('Un mensaje del historial del chat tiene un formato inesperado.');
    }

    const role = entry['role'];
    const content = entry['content'] ?? entry['text'];
    if (typeof content === 'string' && (role === 'user' || role === 'assistant' || role === 'bot')) {
      return [{ role: role === 'user' ? 'user' : 'assistant', content }];
    }

    const userMessage = entry['userMessage'] ?? entry['message'];
    const reply = entry['reply'] ?? entry['botReply'];
    if (typeof userMessage === 'string' && typeof reply === 'string') {
      return [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: reply }
      ];
    }

    throw new Error('Un mensaje del historial del chat no tiene texto o rol válido.');
  }

  private parseReply(response: unknown): string {
    const payload = this.isRecord(response) && 'data' in response ? response['data'] : response;
    if (this.isRecord(payload) && typeof payload['reply'] === 'string' && payload['reply'].trim()) {
      return payload['reply'].trim();
    }
    throw new Error('El servidor no devolvió una respuesta válida para el chat.');
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
