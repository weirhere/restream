"use client";

import * as React from "react";

export type StreamRecord = {
  id: string;
  title: string;
  destinations: string[]; // platform names
  endedAt: number;
  duration: string;
  peakViewers: number;
  deltaPct: number;
};

const STORAGE_KEY = "restream-playground.streams.v1";

const SEED: StreamRecord[] = [
  {
    id: "s-001",
    title: "Building restream-playground — design critique pass",
    destinations: ["Twitch", "YouTube"],
    endedAt: Date.now() - 1000 * 60 * 60 * 22,
    duration: "2h 14m",
    peakViewers: 342,
    deltaPct: 12,
  },
  {
    id: "s-002",
    title: "Friday afternoon hack session — wiring up motion tokens",
    destinations: ["Twitch"],
    endedAt: Date.now() - 1000 * 60 * 60 * 26,
    duration: "1h 03m",
    peakViewers: 178,
    deltaPct: -5,
  },
  {
    id: "s-003",
    title: "Multi-platform broadcast test — six destinations live",
    destinations: ["Twitch", "YouTube", "Facebook", "X", "LinkedIn", "Kick"],
    endedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    duration: "47m",
    peakViewers: 612,
    deltaPct: 38,
  },
  {
    id: "s-004",
    title: "AMA — questions about the design system",
    destinations: ["Twitch", "YouTube"],
    endedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    duration: "1h 41m",
    peakViewers: 289,
    deltaPct: 8,
  },
  {
    id: "s-005",
    title: "Late-night refactor — stream architecture deep dive",
    destinations: ["YouTube"],
    endedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    duration: "3h 28m",
    peakViewers: 421,
    deltaPct: 15,
  },
];

type StreamsContextValue = {
  streams: StreamRecord[];
  recordStream: (input: Omit<StreamRecord, "id" | "endedAt">) => StreamRecord;
  clearStreams: () => void;
  removeStream: (id: string) => void;
};

const StreamsContext = React.createContext<StreamsContextValue | null>(null);

export function useStreams() {
  const ctx = React.useContext(StreamsContext);
  if (!ctx) throw new Error("useStreams must be used within StreamsProvider");
  return ctx;
}

export function StreamsProvider({ children }: { children: React.ReactNode }) {
  const [streams, setStreams] = React.useState<StreamRecord[]>(SEED);
  const hydratedRef = React.useRef(false);

  // hydrate from localStorage on mount
  React.useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StreamRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStreams(parsed);
        }
      } else {
        // first-time visit — persist seed so the library has content
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      }
    } catch {
      /* noop */
    }
  }, []);

  // persist on change (after hydration)
  React.useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(streams));
    } catch {
      /* noop */
    }
  }, [streams]);

  const recordStream = React.useCallback(
    (input: Omit<StreamRecord, "id" | "endedAt">) => {
      const record: StreamRecord = {
        ...input,
        id: `s-${Math.random().toString(36).slice(2, 10)}`,
        endedAt: Date.now(),
      };
      setStreams((prev) => [record, ...prev]);
      return record;
    },
    []
  );

  const clearStreams = React.useCallback(() => setStreams([]), []);
  const removeStream = React.useCallback(
    (id: string) => setStreams((prev) => prev.filter((s) => s.id !== id)),
    []
  );

  const value = React.useMemo(
    () => ({ streams, recordStream, clearStreams, removeStream }),
    [streams, recordStream, clearStreams, removeStream]
  );

  return (
    <StreamsContext.Provider value={value}>{children}</StreamsContext.Provider>
  );
}

/* Helper for human-friendly relative timestamps in the library. */
export function relativeTime(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
