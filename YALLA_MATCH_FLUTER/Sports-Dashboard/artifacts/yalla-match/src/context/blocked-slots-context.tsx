import React, { createContext, useContext, useState } from 'react';

export type BlockedSlot = {
  id: string;
  court: string;
  date: string;   // YYYY-MM-DD
  hour: number;   // 0-23
  reason: string;
  blockedAt: string;
};

type BlockedSlotsContextType = {
  blockedSlots: BlockedSlot[];
  blockSlot: (slot: Omit<BlockedSlot, 'id' | 'blockedAt'>) => void;
  unblockSlot: (id: string) => void;
  isBlocked: (court: string, date: string, hour: number) => boolean;
};

const BlockedSlotsContext = createContext<BlockedSlotsContextType | null>(null);

const INITIAL_SLOTS: BlockedSlot[] = [
  { id: 'b1', court: 'Football Pitch A',   date: '2023-11-06', hour: 12, reason: 'Maintenance',   blockedAt: 'Nov 5, 2023' },
  { id: 'b2', court: 'Football Pitch B',   date: '2023-11-06', hour: 13, reason: 'Staff Training', blockedAt: 'Nov 5, 2023' },
  { id: 'b3', court: 'Basketball Court 1', date: '2023-11-07', hour: 10, reason: 'Private Event',  blockedAt: 'Nov 5, 2023' },
  { id: 'b4', court: 'Tennis Main',        date: '2023-11-06', hour: 15, reason: 'Court Repair',   blockedAt: 'Nov 5, 2023' },
  { id: 'b5', court: 'Volleyball Court',   date: '2023-11-08', hour: 18, reason: '',               blockedAt: 'Nov 5, 2023' },
  { id: 'b6', court: 'Football Pitch A',   date: '2023-11-07', hour:  9, reason: 'Cleaning',       blockedAt: 'Nov 6, 2023' },
  { id: 'b7', court: 'Handball Arena',     date: '2023-11-06', hour: 20, reason: 'Event Setup',    blockedAt: 'Nov 5, 2023' },
  { id: 'b8', court: 'Basketball Court 2', date: '2023-11-09', hour: 16, reason: '',               blockedAt: 'Nov 6, 2023' },
];

let nextId = 100;

export function BlockedSlotsProvider({ children }: { children: React.ReactNode }) {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(INITIAL_SLOTS);

  function blockSlot(slot: Omit<BlockedSlot, 'id' | 'blockedAt'>) {
    const already = blockedSlots.some(
      (b) => b.court === slot.court && b.date === slot.date && b.hour === slot.hour
    );
    if (already) return;
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setBlockedSlots((prev) => [...prev, { ...slot, id: `b${nextId++}`, blockedAt: now }]);
  }

  function unblockSlot(id: string) {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
  }

  function isBlocked(court: string, date: string, hour: number) {
    return blockedSlots.some((b) => b.court === court && b.date === date && b.hour === hour);
  }

  return (
    <BlockedSlotsContext.Provider value={{ blockedSlots, blockSlot, unblockSlot, isBlocked }}>
      {children}
    </BlockedSlotsContext.Provider>
  );
}

export function useBlockedSlots() {
  const ctx = useContext(BlockedSlotsContext);
  if (!ctx) throw new Error('useBlockedSlots must be used inside BlockedSlotsProvider');
  return ctx;
}
