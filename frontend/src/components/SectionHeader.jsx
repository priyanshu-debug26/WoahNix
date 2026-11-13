import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionTo,
  rightSlot,
  badge,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {rightSlot}
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors duration-150"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

