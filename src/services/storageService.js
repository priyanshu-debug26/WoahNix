const STORAGE_PREFIX = 'woahnix:';

export const storageService = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch {
      // Ignore quota or private mode storage errors
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch {
      // Ignore storage errors
    }
  },
};

