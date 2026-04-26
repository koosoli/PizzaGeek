import { useEffect, useState } from "react";

type PersistentStateOptions<T> = {
  legacyKeys?: string[];
  deserialize?: (value: unknown) => T;
};

export function usePersistentState<T>(key: string, initialValue: T, options?: PersistentStateOptions<T>) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    const candidateKeys = [key, ...(options?.legacyKeys ?? [])];
    for (const candidateKey of candidateKeys) {
      const stored = window.localStorage.getItem(candidateKey);
      if (!stored) continue;
      try {
        const parsed = JSON.parse(stored) as unknown;
        return options?.deserialize ? options.deserialize(parsed) : (parsed as T);
      } catch {
        continue;
      }
    }

    return initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
