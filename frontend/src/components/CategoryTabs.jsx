export function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
  className = '',
}) {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto pb-1 ${className}`}
      role="tablist"
      aria-label="Filter by category"
    >
      {categories.map((cat) => {
        const value = cat.id === 'all' ? 'All' : cat.label;
        const isActive = activeCategory === value;

        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(value)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150 cursor-pointer ${
              isActive
                ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border-[var(--accent-primary)]/50'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

