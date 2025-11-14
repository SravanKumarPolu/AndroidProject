import { format, formatDistance, formatDistanceToNow, isPast, isFuture } from 'date-fns';

/**
 * Date utility functions
 * Clean, modern date handling
 */

export const formatDate = (timestamp: number): string => {
  return format(new Date(timestamp), 'MMM d, yyyy');
};

export const formatTime = (timestamp: number): string => {
  return format(new Date(timestamp), 'h:mm a');
};

export const formatDateTime = (timestamp: number): string => {
  return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (timestamp: number): string => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const formatDuration = (start: number, end: number): string => {
  return formatDistance(new Date(start), new Date(end));
};

export const isTimePast = (timestamp: number): boolean => {
  return isPast(new Date(timestamp));
};

export const isTimeFuture = (timestamp: number): boolean => {
  return isFuture(new Date(timestamp));
};

export const getTimeRemaining = (targetTimestamp: number): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} => {
  const now = Date.now();
  const diff = Math.max(0, targetTimestamp - now);
  
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
};

export const addHours = (timestamp: number, hours: number): number => {
  return timestamp + hours * 60 * 60 * 1000;
};

export const addDays = (timestamp: number, days: number): number => {
  return timestamp + days * 24 * 60 * 60 * 1000;
};

