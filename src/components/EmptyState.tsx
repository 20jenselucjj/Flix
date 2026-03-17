import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 px-4 text-center h-full min-h-[50vh]", className)}>
      <div className="bg-zinc-900/50 p-6 rounded-full border border-zinc-800 mb-6">
        <Icon className="w-12 h-12 text-zinc-500" />
      </div>
      <h2 className="text-2xl font-semibold text-zinc-100 mb-3">{title}</h2>
      {description && (
        <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
