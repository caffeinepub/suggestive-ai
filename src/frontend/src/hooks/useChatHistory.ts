import { useState } from "react";

export interface SavedConversation {
  id: string;
  title: string;
  timestamp: number;
  mode: string;
  messages: Array<{ role: string; content: string }>;
}

type HistoryStore = Record<string, SavedConversation[]>;

const STORAGE_KEY = "suggestive_history_v1";

function loadStore(): HistoryStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: HistoryStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage full or unavailable
  }
}

export function useChatHistory() {
  const [store, setStore] = useState<HistoryStore>(loadStore);

  const getConversations = (mode: string): SavedConversation[] =>
    store[mode] ?? [];

  const saveConversation = (
    mode: string,
    messages: Array<{ role: string; content: string }>,
    existingId?: string,
  ): string => {
    const userMessages = messages.filter((m) => m.role === "user");
    if (userMessages.length === 0) return existingId ?? "";

    const id = existingId ?? Date.now().toString();
    const title = userMessages[0].content.slice(0, 40);
    const conversation: SavedConversation = {
      id,
      title,
      timestamp: Date.now(),
      mode,
      messages,
    };

    setStore((prev) => {
      const existing = prev[mode] ?? [];
      const filtered = existing.filter((c) => c.id !== id);
      const updated = [conversation, ...filtered].slice(0, 30);
      const next = { ...prev, [mode]: updated };
      saveStore(next);
      return next;
    });

    return id;
  };

  const deleteConversation = (mode: string, id: string) => {
    setStore((prev) => {
      const updated = (prev[mode] ?? []).filter((c) => c.id !== id);
      const next = { ...prev, [mode]: updated };
      saveStore(next);
      return next;
    });
  };

  const clearAll = (mode: string) => {
    setStore((prev) => {
      const next = { ...prev, [mode]: [] };
      saveStore(next);
      return next;
    });
  };

  return { getConversations, saveConversation, deleteConversation, clearAll };
}
