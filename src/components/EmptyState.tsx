import type { ReactNode } from "react";

export function EmptyState({
  emoji,
  title,
  hint,
  action,
}: {
  emoji: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface animate-rise flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="text-4xl">{emoji}</span>
      <h3 className="font-display text-xl">{title}</h3>
      {hint ? <p className="max-w-xs text-sm text-muted-foreground">{hint}</p> : null}
      {action}
    </div>
  );
}
