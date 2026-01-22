// shared/lib/utils.ts

/* =======================
   Classname helper (cn)
   (аналог clsx + tailwind-merge)
======================= */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* =======================
   Format helpers
======================= */

/** Форматирование чисел (1 200 000 → 1.2M) */
export const formatNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
};

/** Форматирование даты в читаемый вид */
export const formatDate = (
  date: string | Date,
  locale: string = 'en-US'
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(d.getTime())) {
    return 'Invalid date';
  }

  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/* =======================
   Async helpers
======================= */

/** Задержка (полезно для mock API) */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Debounce helper */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}

/* =======================
   Error helpers
======================= */

/** Универсальное извлечение сообщения ошибки */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    if ('data' in error && typeof (error as any).data?.message === 'string') {
      return (error as any).data.message;
    }
  }

  return 'Something went wrong';
};
