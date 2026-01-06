import { create } from 'zustand';
import { apiClient } from "@/api/client/axios.client";
import { useSubscriptionStore } from './useSubscriptionStore';

import type { BaseResponse } from "@/dto/base-response";
import type { ChatSession, Message } from "@/types/ai-chat";
import type {
    SendChatResponse,
    CreateSessionResponse,
    DeleteSessionRequest,
    GetAllSessionsResponse,
    GetChatHistoryResponse,
    SendChatRequest,
} from "@/dto/chatbot";

import type { Note } from "@/types/note";

interface ChatState {
    sessions: ChatSession[];
    activeSessionId: string | null;
    isLoading: boolean;
    isGenerating: boolean;
    showTokenLimitDialog: boolean;
    preloadedReferences: Note[];

    // Actions
    setSessions: (sessions: ChatSession[]) => void;
    setActiveSessionId: (id: string | null) => void;
    setShowTokenLimitDialog: (show: boolean) => void;
    setPreloadedReferences: (notes: Note[]) => void;

    fetchSessions: () => Promise<ChatSession[]>;
    fetchSessionHistory: (sessionId: string) => Promise<void>;
    selectSession: (sessionId: string) => void;
    createSession: () => Promise<string | null>;
    deleteSession: (sessionId: string) => Promise<void>;
    sendMessage: (content: string, sessionId?: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    sessions: [],
    activeSessionId: null,
    isLoading: false,
    isGenerating: false,
    showTokenLimitDialog: false,
    preloadedReferences: [],

    setSessions: (sessions) => set({ sessions }),
    setActiveSessionId: (id) => set({ activeSessionId: id }),
    setShowTokenLimitDialog: (show) => set({ showTokenLimitDialog: show }),
    setPreloadedReferences: (notes) => set({ preloadedReferences: notes }),

    fetchSessions: async () => {
        try {
            const res = await apiClient.get<BaseResponse<GetAllSessionsResponse[]>>(`/chatbot/v1/sessions`);
            const apiData = res.data.data ?? [];

            const newSessions = apiData.map((d) => ({
                id: d.id,
                messages: [],
                name: d.title,
                createdAt: new Date(d.created_at),
                updatedAt: new Date(d.updated_at ?? d.created_at),
            }));

            // Merge with existing messages if any
            const currentSessions = get().sessions;
            const merged = newSessions.map(ns => {
                const existing = currentSessions.find(cs => cs.id === ns.id);
                if (existing) {
                    return { ...ns, messages: existing.messages };
                }
                return ns;
            });

            set({ sessions: merged });
            return merged;
        } catch (error) {
            console.error("Failed to fetch sessions", error);
            return [];
        }
    },

    fetchSessionHistory: async (sessionId) => {
        try {
            const res = await apiClient.get<BaseResponse<GetChatHistoryResponse[]>>(
                `/chatbot/v1/chat-history?chat_session_id=${sessionId}`
            );

            set((state) => ({
                sessions: state.sessions.map((session) => {
                    if (session.id === sessionId) {
                        return {
                            ...session,
                            messages: res.data.data.map<Message>((data) => ({
                                id: data.id,
                                content: data.chat,
                                role: data.role === "model" ? "assistant" : "user",
                                timestamp: new Date(data.created_at),
                                citations: data.citations?.map((c) => ({
                                    noteId: c.note_id,
                                    title: c.title,
                                })),
                                references: data.references?.map((r) => ({
                                    note_id: r.note_id,
                                    title: r.title,
                                    resolved: r.resolved,
                                })),
                                mode: data.mode,
                                nuanceKey: data.nuance_key,
                            })),
                        };
                    }
                    return session;
                })
            }));
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    },

    selectSession: (sessionId) => {
        set({ activeSessionId: sessionId });
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session && session.messages.length === 0) {
            get().fetchSessionHistory(sessionId);
        }
    },

    createSession: async () => {
        try {
            const res = await apiClient.post<BaseResponse<CreateSessionResponse>>(`/chatbot/v1/create-session`);
            const newSession: ChatSession = {
                id: res.data.data.id,
                name: "New Chat",
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            set((state) => ({
                sessions: [newSession, ...state.sessions],
                activeSessionId: newSession.id
            }));
            return newSession.id;
        } catch (error) {
            console.error("Failed to create session", error);
            return null;
        }
    },

    deleteSession: async (sessionId) => {
        try {
            const request: DeleteSessionRequest = { chat_session_id: sessionId };
            await apiClient.delete(`/chatbot/v1/delete-session`, {
                data: request,
            });

            const { activeSessionId } = get();

            set((state) => ({
                sessions: state.sessions.filter((s) => s.id !== sessionId),
                activeSessionId: activeSessionId === sessionId ? null : activeSessionId
            }));
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    },

    sendMessage: async (content, sessionId) => {
        const { activeSessionId } = get();

        // LIMIT CHECK
        // Function to check limit from SubscriptionStore
        const canSend = useSubscriptionStore.getState().checkLimit('chat');
        if (!canSend) {
            set({ showTokenLimitDialog: true });
            return;
        }

        if (!content.trim() || get().isLoading) return;

        // -------------------------------------------------------------------------
        // State Capture & Immediate Cleanup (Optimistic UI)
        // -------------------------------------------------------------------------
        // We capture references NOW and clear the store immediately to make the UI feel reactive ("Released").
        // This avoids prop drilling references through components.
        const { preloadedReferences, setPreloadedReferences } = get();
        const capturedReferences = [...preloadedReferences];
        setPreloadedReferences([]); // Clear pills immediately

        const references = capturedReferences.map(note => ({
            note_id: note.id,
            source_type: "export" as const
        }));

        // -------------------------------------------------------------------------
        // Session Management
        // -------------------------------------------------------------------------

        let currentSessionId = sessionId || activeSessionId;

        // Auto-create session if none exists
        if (!currentSessionId) {
            set({ isLoading: true });
            const newId = await get().createSession();
            if (!newId) {
                set({ isLoading: false });
                // If failed, maybe restore references? 
                // For now, we assume user can re-select if session creation drastically fails.
                return;
            }
            currentSessionId = newId;
        }

        set({ isLoading: true, isGenerating: true });

        // Optimistic Update
        const tempId = "temp-" + Date.now();
        const optimisticMsg: Message = {
            id: tempId,
            content,
            role: "user",
            timestamp: new Date(),
            references: capturedReferences.map(n => ({
                note_id: n.id,
                title: n.title,
                resolved: true,
                source_type: "export"
            }))
        };

        set(state => ({
            sessions: state.sessions.map(s => {
                if (s.id === currentSessionId) {
                    return { ...s, messages: [...s.messages, optimisticMsg] };
                }
                return s;
            })
        }));

        try {
            const request: SendChatRequest = {
                chat: content,
                chat_session_id: currentSessionId,
                references: references.length > 0 ? references : undefined,
            };

            const res = await apiClient.post<BaseResponse<SendChatResponse>>(`/chatbot/v1/send-chat`, request);

            // Update with real response
            const realUserMsg: Message = {
                id: res.data.data.sent.id,
                content: res.data.data.sent.chat,
                role: "user",
                timestamp: new Date(res.data.data.sent.created_at),
                references: res.data.data.sent.references?.map(r => ({
                    note_id: r.note_id,
                    title: r.title,
                    resolved: r.resolved
                }))
            };
            const replyMsg: Message = {
                id: res.data.data.reply.id,
                content: res.data.data.reply.chat,
                role: "assistant" as const,
                timestamp: new Date(res.data.data.reply.created_at),
                citations: res.data.data.reply.citations?.map((c) => ({
                    noteId: c.note_id,
                    title: c.title,
                })),
                mode: res.data.data.mode,
                nuanceKey: res.data.data.nuance_key,
            };

            set(state => ({
                sessions: state.sessions.map(s => {
                    if (s.id === currentSessionId) {
                        const cleanMessages = s.messages.filter(m => m.id !== tempId);
                        return {
                            ...s,
                            name: res.data.data.title,
                            messages: [...cleanMessages, realUserMsg, replyMsg]
                        };
                    }
                    return s;
                })
            }));

        } catch (error) {
            // Handle error (Usage Limits handling skipped for brevity, but technically should be here)
            // Ideally we'd import { handleLimitExceededError } but it depends on 'showPricingModal' context.
            // For now, we fall back to simple error detection.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            if (err.response?.status === 500 &&
                err.response?.data?.message?.includes("daily AI usage limit exceeded")) {
                set({ showTokenLimitDialog: true });
            }

            // Revert optimistic
            set(state => ({
                sessions: state.sessions.map(s => {
                    if (s.id === currentSessionId) {
                        return { ...s, messages: s.messages.filter(m => m.id !== tempId) };
                    }
                    return s;
                })
            }));
        } finally {
            await useSubscriptionStore.getState().fetchSubscription();
            set({ isLoading: false, isGenerating: false });
        }
    }
}));
