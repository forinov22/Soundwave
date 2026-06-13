import { create } from "zustand";
import type { ListenHistoryItem } from "../types";

interface HistoryState {
  listenHistory: ListenHistoryItem[];
  recommendations: ListenHistoryItem[];
  setListenHistory: (items: ListenHistoryItem[]) => void;
  setRecommendations: (items: ListenHistoryItem[]) => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  listenHistory: [],
  recommendations: [],
  setListenHistory: (items) => set({ listenHistory: items }),
  setRecommendations: (items) => set({ recommendations: items }),
}));
