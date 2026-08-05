'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { getEventsConfig, type EventConfig } from '@/lib/config-api';

interface Event {
  name: string;
  duration: number; // in minutes
  color: string;
  bgColor: string;
  borderColor: string; // hex color code
  schedule: (hour: number, minute: number) => boolean; // Function to check if event should run
}

// Default fallback events
const defaultEvents: Event[] = [
  { 
    name: '[Chaos Castle]', 
    duration: 10, 
    color: 'mu-text-red', 
    bgColor: 'rgba(124, 58, 237, 0.15)', 
    borderColor: '#7c3aed',
    schedule: (hour, minute) => hour % 2 === 1 && minute === 0 // Giờ lẻ: 1, 3, 5, 7, 9...
  },
  { 
    name: '[Devil Square]', 
    duration: 10, 
    color: 'mu-text-gold', 
    bgColor: 'rgba(255, 215, 0, 0.15)', 
    borderColor: '#FFD700',
    schedule: (hour, minute) => hour % 4 === 0 && minute === 0 // Giờ chẵn 4h 1 lần: 0, 4, 8, 12...
  },
  { 
    name: '[Blood Castle]', 
    duration: 10, 
    color: 'mu-text-orange', 
    bgColor: 'rgba(255, 102, 0, 0.15)', 
    borderColor: '#FF6600',
    schedule: (hour, minute) => hour % 2 === 0 && minute === 0 // Giờ chẵn 2h 1 lần: 0, 2, 4, 6, 8...
  },
  { 
    name: 'Vua Xuong', 
    duration: 10, 
    color: 'mu-text-gold', 
    bgColor: 'rgba(255, 165, 0, 0.2)', 
    borderColor: '#FFA500',
    schedule: (hour, minute) => hour % 2 === 0 && minute === 5 // Giờ chẵn 2h05: 0:05, 2:05, 4:05...
  },
  { 
    name: 'Rong Do', 
    duration: 10, 
    color: 'mu-text-red', 
    bgColor: 'rgba(124, 58, 237, 0.15)', 
    borderColor: '#5b21b6',
    schedule: (hour, minute) => hour % 2 === 1 && minute === 30 // Giờ lẻ 1h30: 1:30, 3:30, 5:30...
  },
  { 
    name: 'Rong Vang', 
    duration: 10, 
    color: 'mu-text-gold', 
    bgColor: 'rgba(255, 215, 0, 0.12)', 
    borderColor: '#FFD700',
    schedule: (hour, minute) => hour % 2 === 0 && minute === 30 // Giờ chẵn 2h30: 2:30, 4:30...
  },
  { 
    name: 'Binh Doan Phu Thuy', 
    duration: 10, 
    color: 'mu-text-orange', 
    bgColor: 'rgba(255, 102, 0, 0.15)', 
    borderColor: '#FF6600',
    schedule: (hour, minute) => hour % 2 === 1 && minute === 0 // Giờ lẻ 2h 1 lần: 1, 3, 5, 7...
  },
  { 
    name: 'Cursed King', 
    duration: 10, 
    color: 'mu-text-gold', 
    bgColor: 'rgba(255, 215, 0, 0.15)', 
    borderColor: '#FFD700',
    schedule: (hour, minute) => (hour === 13 && minute === 0) || (hour === 20 && minute === 45) // 13:00 và 20:45
  },
  { 
    name: 'Kundun Arena Event', 
    duration: 10, 
    color: 'mu-text-orange', 
    bgColor: 'rgba(255, 165, 0, 0.15)', 
    borderColor: '#FFA500',
    schedule: (hour, minute) => (hour === 11 && minute === 30) || (hour === 19 && minute === 30) || (hour === 21 && minute === 15) // 11:30, 19:30, 21:15
  },
  { 
    name: 'Erohim', 
    duration: 10, 
    color: 'mu-text-red', 
    bgColor: 'rgba(124, 58, 237, 0.15)', 
    borderColor: '#7c3aed',
    schedule: (hour, minute) => (hour === 12 && minute === 30) || (hour === 20 && minute === 15) || (hour === 21 && minute === 45) // 12:30, 20:15, 21:45
  },
];

interface EventRowProps {
  event: Event;
  seconds: number;
  startTimeStr: string;
  isRunning: boolean;
}

const EventRow = memo(function EventRow({ event, seconds, startTimeStr, isRunning }: EventRowProps) {
  const isSoon = seconds > 0 && seconds <= 300;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="border-b border-white/10 px-1 py-2 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span
          className="truncate font-semibold uppercase leading-tight"
          style={{ color: '#FFD700', fontSize: '0.8rem', fontFamily: 'var(--font-main)' }}
        >
          {event.name}
          {isRunning && <span className="ml-1 font-sans text-[0.65rem] opacity-90">(Đang diễn ra)</span>}
        </span>
        <span className="shrink-0 text-[0.8rem] font-medium tabular-nums text-white">{startTimeStr}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="shrink-0 text-[0.7rem] uppercase text-white/60">Còn</span>
        <span
          className="shrink-0 font-mono text-[0.85rem] font-bold tabular-nums"
          style={{ color: isSoon ? '#FF4444' : '#FFD700', letterSpacing: '0.03em' }}
        >
          {timeStr}
        </span>
      </div>
    </div>
  );
});

const EventCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});
  const [nextStartTime, setNextStartTime] = useState<{ [key: string]: string }>({});
  const [runningEvents, setRunningEvents] = useState<{ [key: string]: boolean }>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [events, setEvents] = useState<Event[]>(defaultEvents);
  const { isSupported, permission, requestPermission, showEventNotification } = useNotifications();
  const notificationSent = useRef<{ [key: string]: { fiveMin: boolean; started: boolean } }>({});

  // Load events from backend API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsConfig = await getEventsConfig();
        if (eventsConfig && eventsConfig.length > 0) {
          // Convert API events to component events format
          const convertedEvents: Event[] = eventsConfig.map((eventConfig: EventConfig) => {
            // Convert schedule to function
            let scheduleFn: (hour: number, minute: number) => boolean;
            
            if (eventConfig.schedule.type === 'hourly') {
              const interval = eventConfig.schedule.interval || 2;
              const startMinute = eventConfig.schedule.startMinute || 0;
              scheduleFn = (hour: number, minute: number) => {
                if (minute !== startMinute) return false;
                // Check if hour matches the interval pattern
                // For interval 2: hours 0, 2, 4, 6, 8... or 1, 3, 5, 7, 9...
                // For interval 4: hours 0, 4, 8, 12, 16, 20...
                return hour % interval === (startMinute === 0 ? 0 : 1);
              };
            } else if (eventConfig.schedule.type === 'specific') {
              const times = eventConfig.schedule.times || [];
              scheduleFn = (hour: number, minute: number) => {
                return times.some(time => {
                  const [h, m] = time.split(':').map(Number);
                  return h === hour && m === minute;
                });
              };
            } else {
              // Default fallback
              scheduleFn = () => false;
            }

            // Map color to CSS class
            const colorMap: { [key: string]: string } = {
              '#CC0000': 'mu-text-red',
              '#7c3aed': 'mu-text-red',
              '#7C3AED': 'mu-text-red',
              '#FFD700': 'mu-text-gold',
              '#FF6600': 'mu-text-orange',
              '#FFA500': 'mu-text-gold',
              '#990000': 'mu-text-red',
              '#5b21b6': 'mu-text-red',
              '#5B21B6': 'mu-text-red',
            };

            // Convert hex to rgba for bgColor
            const hexToRgba = (hex: string, alpha: number) => {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };

            return {
              name: eventConfig.name,
              duration: eventConfig.schedule.duration || 10,
              color: colorMap[eventConfig.color] || 'mu-text-gold',
              bgColor: hexToRgba(eventConfig.color, 0.15),
              borderColor: eventConfig.color,
              schedule: scheduleFn,
            };
          });
          
          setEvents(convertedEvents);
        }
      } catch (error) {
        console.error('Error loading events from API:', error);
        // Keep default events on error
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();
      
      const newTimeLeft: { [key: string]: number } = {};
      const newNextStart: { [key: string]: string } = {};
      const newRunning: { [key: string]: boolean } = {};
      
      events.forEach((event) => {
        // Check if event is currently running
        if (event.schedule(currentHour, currentMinute) && currentSecond < event.duration * 60) {
          newRunning[event.name] = true;
          const totalEventSeconds = event.duration * 60;
          const remainingSeconds = totalEventSeconds - currentSecond;
          newTimeLeft[event.name] = Math.max(0, remainingSeconds);
          newNextStart[event.name] = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
          if (notificationsEnabled && permission.granted && !notificationSent.current[event.name]?.started) {
            showEventNotification(event.name, 0, true);
            notificationSent.current[event.name] = { ...notificationSent.current[event.name], started: true };
          }
        } else {
          let nextEventTime: number | null = null;
          let nextEventDate: Date | null = null;
          for (let hour = currentHour; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute++) {
              if (event.schedule(hour, minute)) {
                const eventTime = new Date(now);
                eventTime.setHours(hour, minute, 0, 0);
                const timeDiff = (eventTime.getTime() - now.getTime()) / 1000;
                if (timeDiff > 0) {
                  nextEventTime = timeDiff;
                  nextEventDate = eventTime;
                  break;
                }
              }
            }
            if (nextEventTime != null) break;
          }
          if (nextEventTime == null) {
            for (let hour = 0; hour < 24; hour++) {
              for (let minute = 0; minute < 60; minute++) {
                if (event.schedule(hour, minute)) {
                  const eventTime = new Date(now);
                  eventTime.setDate(eventTime.getDate() + 1);
                  eventTime.setHours(hour, minute, 0, 0);
                  const timeDiff = (eventTime.getTime() - now.getTime()) / 1000;
                  if (timeDiff > 0) {
                    nextEventTime = timeDiff;
                    nextEventDate = eventTime;
                    break;
                  }
                }
              }
              if (nextEventTime != null) break;
            }
          }
          newTimeLeft[event.name] = nextEventTime ?? 0;
          if (nextEventDate) {
            newNextStart[event.name] = `${nextEventDate.getHours().toString().padStart(2, '0')}:${nextEventDate.getMinutes().toString().padStart(2, '0')}`;
          } else {
            newNextStart[event.name] = '--:--';
          }
          if (notificationsEnabled && permission.granted && nextEventTime != null && nextEventTime <= 300) {
            if (!notificationSent.current[event.name]?.fiveMin) {
              showEventNotification(event.name, nextEventTime, false);
              notificationSent.current[event.name] = { ...notificationSent.current[event.name], fiveMin: true };
            }
          }
          if (nextEventTime != null && nextEventTime > 600) {
            notificationSent.current[event.name] = { fiveMin: false, started: false };
          }
        }
      });
      setTimeLeft(newTimeLeft);
      setNextStartTime(newNextStart);
      setRunningEvents(newRunning);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [events, notificationsEnabled, permission.granted, showEventNotification]);

  // Initialize notifications on component mount and auto-request permission
  useEffect(() => {
    if (isSupported) {
      if (permission.granted) {
        setNotificationsEnabled(true);
        // Show welcome notification when permission is first granted
        showEventNotification('Chào mừng!', 0, false);
      } else if (permission.default) {
        // Auto-request permission when page loads
        requestPermission();
      } else {
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
    }
  }, [isSupported, permission, requestPermission, showEventNotification]);

  return (
    <div className="event-countdown-list space-y-0">
      {events.map((event) => (
        <EventRow
          key={event.name}
          event={event}
          seconds={timeLeft[event.name] || 0}
          startTimeStr={nextStartTime[event.name] || '--:--'}
          isRunning={runningEvents[event.name] ?? false}
        />
      ))}
    </div>
  );
};

export default EventCountdown;
