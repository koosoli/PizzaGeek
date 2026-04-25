import { useEffect, useState } from "react";

type PersistentStateOptions = {
  legacyKeys?: string[];
};

export function usePersistentState<T>(key: string, initialValue: T, options?: PersistentStateOptions) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    const candidateKeys = [key, ...(options?.legacyKeys ?? [])];
    for (const candidateKey of candidateKeys) {
      const stored = window.localStorage.getItem(candidateKey);
      if (!stored) continue;
      try {
        return JSON.parse(stored) as T;
      } catch {
        return initialValue;
      }
    }

    return initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
