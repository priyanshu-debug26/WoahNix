import { useMemo, useState } from 'react';
import { Compass, Code2, Flag, Cpu, Gamepad2, Music } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import { SectionHeader } from '../components/SectionHeader';
import { VideoCard } from '../components/VideoCard';
import { EmptyState } from '../components/EmptyState';

const TOPIC_ICONS = {
  Programming: Code2,
  'Formula 1': Flag,
  Technology: Cpu,
  Gaming: Gamepad2,
  Music: Music,
};

export function ExplorePage() {
  const { videos, categories, exploreTopics, searchQuery } = useMedia();
  const [activeCategory, setActiveCategory] = useState('All');
  const [localQuery, setLocalQuery] = useState('');

  const combinedQuery = (localQuery || searchQuery).trim().toLowerCase();

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const catMatch =
        activeCategory === 'All' || video.category === activeCategory;
      if (!catMatch) return false;
      if (!combinedQuery) return true;
      return (
        video.title.toLowerCase().includes(combinedQuery) ||
        video.channelName.toLowerCase().includes(combinedQuery) ||
        video.category.toLowerCase().includes(combinedQuery) ||
        video.description.toLowerCase().includes(combinedQuery)
      );
    });
  }, [videos, activeCategory, combinedQuery]);

  return (
    <div className="space-y-9">
      {/* Topic Categories */}
      <section>
        <SectionHeader
          title="Topic Categories"
          subtitle="Pick a subject to narrow down recommendations across YouTube"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {exploreTopics.map((topic) => {
            const Icon = TOPIC_ICONS[topic.id] || Compass;
            const isActive = activeCategory === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() =>
                  setActiveCategory(isActive ? 'All' : topic.id)
                }
                className={`text-left p-4 rounded-xl border transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)]/40 hover:bg-[var(--bg-elevated)]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      isActive
                        ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40 text-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {topic.videoCount} videos
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {topic.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                  {topic.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search + Category Filter Bar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
          <SearchBar
            id="explore-search"
            value={localQuery}
            onChange={setLocalQuery}
            placeholder="Filter explore results..."
            className="w-full md:w-72 shrink-0"
          />
        </div>

        <SectionHeader
          title="Discover Videos"
          subtitle={`${filteredVideos.length} recommendation${
            filteredVideos.length === 1 ? '' : 's'
          } matching your filters`}
        />

        {filteredVideos.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Nothing found for that filter"
            description="Try a different keyword or select another topic category."
            action={
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setLocalQuery('');
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
              >
                Clear explore filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

