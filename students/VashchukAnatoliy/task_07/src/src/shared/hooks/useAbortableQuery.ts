import { useCallback, useEffect, useRef } from 'react';

/* =========================================================
   useAbortableQuery
   Отменяет запросы при размонтировании компонента
========================================================= */

export const useAbortableQuery = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Возвращает AbortSignal для передачи в fetch / RTK Query / axios
   */
  const getSignal = useCallback((): AbortSignal | undefined => {
    return abortControllerRef.current?.signal;
  }, []);

  return { getSignal };
};

/* =========================================================
   useCancelableQuery
   Отменяет предыдущий запрос при каждом новом вызове
   Полезно для поиска, фильтрации, live-input
========================================================= */

export const useCancelableQuery = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Отменяет предыдущий запрос и создает новый AbortSignal
   */
  const getSignal = useCallback((): AbortSignal => {
    abortControllerRef.current?.abort();

    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { getSignal };
};
