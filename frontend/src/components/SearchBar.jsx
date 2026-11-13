import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search videos, channels, or streams...',
  className = '',
  id = 'global-search',
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 pointer-events-none"
        aria-hidden="true"
      />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm pl-9 pr-8 py-2 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors duration-150"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 p-0.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

