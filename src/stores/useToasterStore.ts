import { create } from 'zustand';

interface ToasterState {
    isSoundEnabled: boolean;
    toggleSound: () => void;
    setSoundEnabled: (enabled: boolean) => void;
}

export const useToasterStore = create<ToasterState>((set) => ({
    isSoundEnabled: true,
    toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
    setSoundEnabled: (enabled) => set({ isSoundEnabled: enabled }),
}));
