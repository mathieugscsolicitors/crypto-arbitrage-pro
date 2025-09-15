import React from 'react';
import { cn } from '../../lib/utils';

// Grille responsive optimisée pour mobile
interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
}

export function MobileGrid({ 
  children, 
  className, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4 
}: MobileGridProps) {
  const gridClasses = cn(
    'grid',
    `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    `gap-${gap}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// Container responsive avec padding adaptatif
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
}

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = '7xl' 
}: ResponsiveContainerProps) {
  const containerClasses = cn(
    'w-full mx-auto px-4 sm:px-6 lg:px-8',
    `max-w-${maxWidth}`,
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

// Stack vertical avec espacement adaptatif
interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: number;
}

export function MobileStack({ 
  children, 
  className, 
  spacing = 4 
}: MobileStackProps) {
  const stackClasses = cn(
    'flex flex-col',
    `space-y-${spacing}`,
    className
  );

  return (
    <div className={stackClasses}>
      {children}
    </div>
  );
}

// Flex responsive avec wrap automatique
interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: number;
}

export function ResponsiveFlex({ 
  children, 
  className,
  direction = 'row',
  wrap = true,
  justify = 'start',
  align = 'start',
  gap = 4
}: ResponsiveFlexProps) {
  const flexClasses = cn(
    'flex',
    direction === 'col' ? 'flex-col' : 'flex-row',
    wrap && 'flex-wrap',
    `justify-${justify}`,
    `items-${align}`,
    `gap-${gap}`,
    className
  );

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
}
