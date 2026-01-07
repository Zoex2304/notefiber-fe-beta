/**
 * WebSocket client for real-time notifications
 * 
 * Handles connection lifecycle, reconnection logic, and message parsing.
 */

import { websocketMessageSchema } from '../services/notification/notification.schemas';
import type { WebSocketMessage } from '../services/notification/notification.types';

export interface WebSocketClientOptions {
    /** Base WebSocket URL (e.g., 'ws://localhost:8080/api/ws') */
    baseUrl: string;
    /** User token/ID for authentication */
    token: string;
    /** Callback when a notification is received */
    onNotification: (message: WebSocketMessage) => void;
    /** Callback when connection is established */
    onOpen?: () => void;
    /** Callback when connection is closed */
    onClose?: () => void;
    /** Callback when an error occurs */
    onError?: (error: Event) => void;
    /** Reconnection delay in ms (default: 5000) */
    reconnectDelay?: number;
}

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private options: WebSocketClientOptions;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private isIntentionalClose = false;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 10;

    constructor(options: WebSocketClientOptions) {
        this.options = {
            reconnectDelay: 5000,
            ...options,
        };
    }

    /**
     * Establish WebSocket connection
     */
    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        this.isIntentionalClose = false;
        const url = `${this.options.baseUrl}?token=${this.options.token}`;

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.options.onOpen?.();
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
            this.options.onClose?.();

            if (!this.isIntentionalClose) {
                this.scheduleReconnect();
            }
        };

        this.ws.onerror = (error) => {
            console.error('[WS] Error:', error);
            this.options.onError?.(error);
        };
    }

    /**
     * Disconnect WebSocket
     */
    disconnect(): void {
        this.isIntentionalClose = true;
        this.clearReconnectTimer();

        const socket = this.ws;
        if (socket) {
            this.ws = null;

            if (socket.readyState === WebSocket.CONNECTING) {
                // If still connecting, wait for open before closing to avoid 1005 errors
                // This handles React StrictMode double-mount scenarios gracefully
                socket.onopen = () => {
                    socket.close(1000, 'Client disconnect (during connect)');
                };
                // Clear other handlers to prevent side effects
                socket.onmessage = null;
                socket.onerror = null;
            } else {
                socket.close(1000, 'Client disconnect');
            }
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    private handleMessage(data: string): void {
        try {
            const parsed = JSON.parse(data);
            const result = websocketMessageSchema.safeParse(parsed);

            if (result.success) {
                this.options.onNotification(result.data);
            } else {
                console.warn('[WS] Invalid message format:', result.error);
            }
        } catch (error) {
            console.error('[WS] Failed to parse message:', error);
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[WS] Max reconnection attempts reached');
            return;
        }

        this.clearReconnectTimer();
        this.reconnectAttempts++;

        const delay = this.options.reconnectDelay! * Math.min(this.reconnectAttempts, 5);
        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
}

/**
 * Get WebSocket URL from current environment
 * Uses VITE_API_BASE_URL to derive the backend WebSocket endpoint
 */
export function getWebSocketUrl(): string {
    // If explicit WS host is set, use it
    if (import.meta.env.VITE_WS_HOST) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${import.meta.env.VITE_WS_HOST}/api/ws`;
    }

    // Otherwise derive from API base URL (e.g., http://localhost:3000/api -> ws://localhost:3000/api/ws)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://notefiber-be-beta-production.up.railway.app';

    try {
        const url = new URL(apiBaseUrl);
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${url.host}/api/ws`;
    } catch {
        // Fallback for development
        return 'wss://notefiber-be-beta-production.up.railway.app/api/ws';
    }
}

