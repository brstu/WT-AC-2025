import { useEffect, useRef } from 'react';

/**
 * Хук для автоматической отмены запросов при размонтировании компонента
 * Возвращает функцию для получения AbortSignal
 */
export const useAbortableQuery = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Создаем новый AbortController при монтировании
    abortControllerRef.current = new AbortController();

    return () => {
      // Отменяем все активные запросы при размонтировании
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Возвращаем функцию для получения signal, а не сам ref
  return () => abortControllerRef.current?.signal;
};

/**
 * Хук для отмены предыдущего запроса при новом запросе
 * Полезен для поисковых запросов или фильтрации
 */
export const useCancelableQuery = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const getSignal = () => {
    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Создаем новый AbortController
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  };

  useEffect(() => {
    return () => {
      // Отменяем все активные запросы при размонтировании
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { getSignal };
};
