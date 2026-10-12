import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'current'
    | 'discontinued'
    | 'high'
    | 'medium'
    | 'low'
    | 'uncertain'
    | 'info'
    | 'neutral'
    | 'danger'
    | 'warning'
    | 'success';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  icon,
}) => {
  const variantStyles = {
    current: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    discontinued: 'bg-slate-100 text-slate-700 border-slate-300',
    high: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    medium: 'bg-amber-100 text-amber-900 border-amber-300',
    low: 'bg-orange-100 text-orange-900 border-orange-300',
    uncertain: 'bg-rose-100 text-rose-900 border-rose-300',
    info: 'bg-sky-50 text-sky-800 border-sky-300',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
    danger: 'bg-rose-100 text-rose-900 border-rose-300',
    warning: 'bg-amber-100 text-amber-900 border-amber-300',
    success: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
