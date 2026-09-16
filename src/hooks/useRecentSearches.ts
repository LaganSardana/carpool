import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripType } from '../types';

const STORAGE_KEY = '@carpool/recent-searches';
const MAX_SAVED = 3;

export interface RecentSearch {
  from: string;
  to: string;
  tripType: TripType | 'all';
}

function sameSearch(a: RecentSearch, b: RecentSearch): boolean {
  return (
    a.from.toLowerCase() === b.from.toLowerCase() &&
    a.to.toLowerCase() === b.to.toLowerCase() &&
    a.tripType === b.tripType
  );
}

export function useRecentSearches() {
  const [recents, setRecents] = useState<RecentSearch[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setRecents(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);

  const save = useCallback((search: RecentSearch) => {
    if (!search.from.trim()) return;
    setRecents((prev) => {
      const next = [
        search,
        ...prev.filter((r) => !sameSearch(r, search)),
      ].slice(0, MAX_SAVED);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecents([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  return { recents, save, clear };
}
