// Client-side helpers. The creator's admin key and their group list live in
// localStorage so no login is needed — sharing the URL never leaks the key.

export interface LocalGroup {
  id: string;
  title: string;
}

const GROUPS_KEY = "wc2026-groups";
const adminKeyFor = (id: string) => `wc2026-admin-${id}`;

export function saveAdminKey(id: string, key: string): void {
  try {
    localStorage.setItem(adminKeyFor(id), key);
  } catch {
    /* ignore */
  }
}

export function getAdminKey(id: string): string | null {
  try {
    return localStorage.getItem(adminKeyFor(id));
  } catch {
    return null;
  }
}

export function listLocalGroups(): LocalGroup[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return raw ? (JSON.parse(raw) as LocalGroup[]) : [];
  } catch {
    return [];
  }
}

export function addLocalGroup(group: LocalGroup): void {
  try {
    const list = listLocalGroups().filter((g) => g.id !== group.id);
    list.unshift(group);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {
    /* ignore */
  }
}
