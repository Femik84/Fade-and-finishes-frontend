import { apiGet } from '../utils/constant'; // adjust path if needed
import { getCache, setCache } from '../utils/cache';

export type ApiServiceRaw = {
  id: number;
  name: string;
  price?: string | number;
  duration?: string | number;
  short_description?: string;
  long_description?: string;
  hero_image?: string;
  image?: string;
  // ...other backend fields
};

export type ApiBarberRaw = {
  id: number;
  name: string;
  photo?: string;
  specialties?: Array<{ id: number; name: string } | string>;
  // ...other backend fields
};

export type Service = {
  id: number;
  name: string;
  price: number;
  duration: string;
  description?: string;
  image?: string;
};

export type Barber = {
  id: number;
  name: string;
  photo?: string;
  specialties: string[]; // names only
};

// Cache keys / TTL
const SERVICES_CACHE_KEY = 'services_v1';
const BARBERS_CACHE_KEY = 'barbers_v1';
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

function normalizePrice(price?: string | number): number {
  if (price == null) return 0;
  if (typeof price === 'number') return price;
  const parsed = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
  return parsed;
}

function normalizeDuration(duration?: string | number): string {
  if (duration == null || duration === '') return '—';
  if (typeof duration === 'number') return `${duration} min`;
  if (/^\d+$/.test(String(duration))) return `${duration} min`;
  return String(duration);
}

/**
 * getServices(force?: boolean)
 * - If force = true, skip cache and fetch fresh data.
 * - On success: stores the mapped Service[] in cache and returns it.
 * - On network error: falls back to cached mapped data (if present) otherwise returns [].
 */
export async function getServices(force = false): Promise<Service[]> {
  try {
    if (!force) {
      const cached = getCache(SERVICES_CACHE_KEY) as Service[] | null;
      if (cached && Array.isArray(cached)) return cached;
    }

    const raw = await apiGet<ApiServiceRaw[]>('services/');
    const mapped: Service[] = (raw || []).map((s) => ({
      id: s.id,
      name: s.name,
      price: normalizePrice(s.price),
      duration: normalizeDuration(s.duration),
      description: s.short_description || s.long_description || '',
      image: s.hero_image || s.image || '',
    }));

    try {
      setCache(SERVICES_CACHE_KEY, mapped, DEFAULT_TTL);
    } catch {
      // ignore localStorage failures
    }

    return mapped;
  } catch (err) {
    // network error -> try cache
    const fallback = getCache(SERVICES_CACHE_KEY) as Service[] | null;
    if (fallback && Array.isArray(fallback)) return fallback;
    // otherwise return empty array
    return [];
  }
}

/**
 * getBarbers(force?: boolean)
 * - Same caching behaviour as getServices.
 */
export async function getBarbers(force = false): Promise<Barber[]> {
  try {
    if (!force) {
      const cached = getCache(BARBERS_CACHE_KEY) as Barber[] | null;
      if (cached && Array.isArray(cached)) return cached;
    }

    const raw = await apiGet<ApiBarberRaw[]>('artists/');
    const mapped: Barber[] = (raw || []).map((b) => {
      const specialties = Array.isArray(b.specialties)
        ? b.specialties.map((s) => (typeof s === 'string' ? s : (s as any).name || String(s)))
        : [];
      return {
        id: b.id,
        name: b.name,
        photo: b.photo,
        specialties,
      };
    });

    try {
      setCache(BARBERS_CACHE_KEY, mapped, DEFAULT_TTL);
    } catch {
      // ignore localStorage failures
    }

    return mapped;
  } catch (err) {
    const fallback = getCache(BARBERS_CACHE_KEY) as Barber[] | null;
    if (fallback && Array.isArray(fallback)) return fallback;
    return [];
  }
}

// Optional helpers (exported) to invalidate caches if needed elsewhere:
export function clearServicesCache() {
  try {
    setCache(SERVICES_CACHE_KEY, [], 0); // quick way to expire
  } catch {}
}
export function clearBarbersCache() {
  try {
    setCache(BARBERS_CACHE_KEY, [], 0);
  } catch {}
}