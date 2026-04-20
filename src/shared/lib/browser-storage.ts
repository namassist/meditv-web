const storage = typeof window === "undefined" ? null : window.localStorage;

export function readJson<T>(key: string): T | null {
  if (!storage) return null;
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function writeJson(key: string, value: unknown) {
  storage?.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string) {
  storage?.removeItem(key);
}
