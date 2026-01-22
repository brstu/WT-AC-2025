import { ReactNode } from 'react';
import './Card.css';

export interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return <div className={`card ${className}`}>{children}</div>;
};
