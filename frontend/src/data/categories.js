export const CATEGORIES = [
  { id: 'all', label: 'All', description: 'Everything across your subscriptions and interests' },
  { id: 'Programming', label: 'Programming', description: 'Systems design, compilers, web engineering & tooling' },
  { id: 'Gaming', label: 'Gaming', description: 'Indie showcases, strategy runs, and devlogs' },
  { id: 'Formula 1', label: 'Formula 1', description: 'Telemetry breakdowns, race strategy & onboard analysis' },
  { id: 'Music', label: 'Music', description: 'Modular synthesis, live sessions & production notes' },
  { id: 'Technology', label: 'Technology', description: 'Hardware architecture, silicon & computing history' },
];

export const TOPIC_OPTIONS = CATEGORIES.filter((cat) => cat.id !== 'all').map(
  (cat) => cat.label
);

export const EXPLORE_TOPICS = [
  {
    id: 'Programming',
    name: 'Programming',
    tagline: 'Compilers, distributed systems, and clean interfaces',
    accent: '#D97745',
  },
  {
    id: 'Formula 1',
    name: 'Formula 1',
    tagline: 'Aerodynamics, pit wall strategy, and lap telemetry',
    accent: '#D97745',
  },
  {
    id: 'Technology',
    name: 'Technology',
    tagline: 'Custom silicon, mechanical keyboards, and repair culture',
    accent: '#D97745',
  },
  {
    id: 'Gaming',
    name: 'Gaming',
    tagline: 'Long-form essays, roguelike runs, and engine deep dives',
    accent: '#D97745',
  },
  {
    id: 'Music',
    name: 'Music',
    tagline: 'Analog synths, acoustic sessions, and sound design',
    accent: '#D97745',
  },
];
