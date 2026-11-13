import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { TOPIC_OPTIONS } from '../data/categories';

export function SubscriptionForm({
  onSubmit,
  placeholder,
  ariaLabel,
  submitLabel = 'Add',
  defaultCategory = 'Programming',
  isPending = false,
  compact = false,
}) {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSubmit(input, category);
    if (result?.error) {
      setFeedback({ type: 'error', message: result.error });
      return;
    }
    setInput('');
    if (result?.successMessage) {
      setFeedback({ type: 'success', message: result.successMessage });
    } else {
      setFeedback(null);
    }
  };

  return (
    <div className="space-y-2">
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col sm:flex-row gap-3 ${compact ? 'sm:items-center' : ''}`}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (feedback) setFeedback(null);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={isPending}
          className="flex-1 bg-[var(--bg-main)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors disabled:opacity-60"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
          disabled={isPending}
          className="bg-[var(--bg-main)] text-[var(--text-primary)] text-sm px-3 py-2 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-60"
        >
          {TOPIC_OPTIONS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>{isPending ? 'Saving...' : submitLabel}</span>
        </button>
      </form>

      {feedback && (
        <p
          className={`text-xs flex items-center gap-1.5 ${
            feedback.type === 'error'
              ? 'text-[#E57368]'
              : 'text-[var(--accent-primary)]'
          }`}
        >
          {feedback.type === 'success' && <Check className="w-3.5 h-3.5" />}
          <span>{feedback.message}</span>
        </p>
      )}
    </div>
  );
}

