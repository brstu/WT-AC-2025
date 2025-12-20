// src/shared/ui/LazyWrapper.tsx
import { Suspense, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function LazyWrapper({ children }: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}
