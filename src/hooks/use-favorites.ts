import { useState, useEffect } from "react";

const STORAGE_KEY = "halong_favorites";
const FAVORITES_CHANGED_EVENT = "halong_favorites_changed";

export function getFavoritesFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteInStorage(id: string): string[] {
  if (typeof window === "undefined") return [];
  const current = getFavoritesFromStorage();
  const idx = current.indexOf(id);
  let next: string[];
  if (idx > -1) {
    next = current.filter((item) => item !== id);
  } else {
    next = [...current, id];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT, { detail: next }));
  } catch (err) {
    console.error(err);
  }
  return next;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoritesFromStorage());

    const handleChanged = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      setFavorites(customEvent.detail || getFavoritesFromStorage());
    };

    window.addEventListener(FAVORITES_CHANGED_EVENT, handleChanged);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, handleChanged);
    };
  }, []);

  const toggleFavorite = (id: string) => {
    toggleFavoriteInStorage(id);
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}
