'use client';

import React, { useEffect, useState } from 'react';
import { getEventsConfig, type EventConfig } from '@/lib/config-api';

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

type LiveEvent = {
  id: number;
  name: string;
  seconds: number;
  running: boolean;
};

function scheduleMatches(ev: EventConfig, hour: number, minute: number): boolean {
  const s = ev.schedule;
  if (s.type === 'hourly') {
    const interval = s.interval || 2;
    const startMinute = s.startMinute || 0;
    if (minute !== startMinute) return false;
    return hour % interval === (startMinute === 0 ? 0 : 1);
  }
  if (s.type === 'specific') {
    return (s.times || []).some((t) => {
      const [h, m] = t.split(':').map(Number);
      return h === hour && m === minute;
    });
  }
  return false;
}

function computeEvent(ev: EventConfig, now: Date): { seconds: number; running: boolean } {
  const h = now.getHours();
  const m = now.getMinutes();
  const sec = now.getSeconds();
  const duration = ev.schedule.duration || 10;

  if (scheduleMatches(ev, h, m) && sec < duration * 60) {
    return { seconds: duration * 60 - sec, running: true };
  }

  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
    const startHour = dayOffset === 0 ? h : 0;
    for (let hour = startHour; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        if (!scheduleMatches(ev, hour, minute)) continue;
        const t = new Date(now);
        t.setDate(t.getDate() + dayOffset);
        t.setHours(hour, minute, 0, 0);
        const diff = Math.floor((t.getTime() - now.getTime()) / 1000);
        if (diff > 0) return { seconds: diff, running: false };
      }
    }
  }
  return { seconds: 0, running: false };
}

function formatCountdown(seconds: number): string {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = Math.floor(seconds % 60);
  return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

function cleanName(name: string): string {
  return name.replace(/[[\]]/g, '').trim();
}

const FALLBACK_EVENTS: EventConfig[] = [
  { id: 1, name: 'Chaos Castle', schedule: { type: 'hourly', interval: 2, startMinute: 0, duration: 10 }, color: '#9b7ecf' },
  { id: 2, name: 'Devil Square', schedule: { type: 'hourly', interval: 4, startMinute: 0, duration: 10 }, color: '#b49ae0' },
  { id: 3, name: 'Blood Castle', schedule: { type: 'hourly', interval: 2, startMinute: 0, duration: 10 }, color: '#8a6bb8' },
];

export default function EventsDock({ open, onOpen, onClose }: Props) {
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [live, setLive] = useState<LiveEvent[]>([]);

  useEffect(() => {
    getEventsConfig().then((evs) => {
      setEvents(evs && evs.length > 0 ? evs : FALLBACK_EVENTS);
    });
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const source = events.length > 0 ? events : FALLBACK_EVENTS;
      setLive(
        source.map((ev) => {
          const { seconds, running } = computeEvent(ev, now);
          return { id: ev.id, name: cleanName(ev.name), seconds, running };
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [events]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className="ns-dock">
        <button
          type="button"
          className="ns-dock-fab"
          onClick={onOpen}
          aria-label="Mở sự kiện"
          title="Sự kiện"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" />
          </svg>
        </button>
        <span className="ns-dock-hint">Sự kiện</span>
      </div>

      {open && (
        <>
          <div className="ns-popup-backdrop" onClick={onClose} aria-hidden />
          <div className="ns-popup" role="dialog" aria-modal="true" aria-labelledby="ns-events-title">
            <div className="ns-popup-head">
              <h2 id="ns-events-title" className="ns-popup-title">Sự kiện trong game</h2>
              <button type="button" className="ns-popup-close" onClick={onClose} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className="ns-popup-body">
              {live.length === 0 ? (
                <div className="ns-event-empty">Chưa có sự kiện nào.</div>
              ) : (
                live.map((ev) => (
                  <div key={ev.id} className={`ns-event-row${ev.running ? ' is-live' : ''}`}>
                    <div className="ns-event-name">
                      {ev.running ? '● ' : ''}
                      {ev.name}
                    </div>
                    <div className="ns-event-time">
                      {ev.running ? `Còn ${formatCountdown(ev.seconds)}` : formatCountdown(ev.seconds)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
