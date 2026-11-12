export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] ${className}`}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 text-[var(--text-secondary)]">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-base font-medium text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-md mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

