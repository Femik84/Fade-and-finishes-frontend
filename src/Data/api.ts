import { API_BASE_URL } from '../utils/constant';
import type { Artist, Category, Review } from '../utils/type';
import { getCache, setCache } from '../utils/cache';

// Default TTL: 1 hour (ms). Change as needed.
const DEFAULT_TTL = 1000 * 60 * 60;

const safeFetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} - ${res.status}`);
  }
  return await res.json();
};

/**
 * fetchArtists(force?: boolean)
 * - force: skip cache and fetch from network.
 */
export const fetchArtists = async (force = false): Promise<Artist[]> => {
  const cacheKey = 'artists_v1';
  if (!force) {
    const cached = getCache(cacheKey);
    if (cached) return cached as Artist[];
  }

  try {
    const data = await safeFetchJson(`${API_BASE_URL}artists/`);
    setCache(cacheKey, data, DEFAULT_TTL);
    return data;
  } catch (error) {
    console.error('Error fetching artists:', error);
    // If network failed, try to return stale cached data if present
    const fallback = getCache(cacheKey);
    return (fallback as Artist[]) || [];
  }
};

export const fetchCategories = async (force = false): Promise<Category[]> => {
  const cacheKey = 'categories_v1';
  if (!force) {
    const cached = getCache(cacheKey);
    if (cached) return cached as Category[];
  }

  try {
    const data = await safeFetchJson(`${API_BASE_URL}categories/`);
    setCache(cacheKey, data, DEFAULT_TTL);
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    const fallback = getCache(cacheKey);
    return (fallback as Category[]) || [];
  }
};

export const fetchReviews = async (force = false): Promise<Review[]> => {
  const cacheKey = 'reviews_v1';
  if (!force) {
    const cached = getCache(cacheKey);
    if (cached) return cached as Review[];
  }

  try {
    const data = await safeFetchJson(`${API_BASE_URL}reviews/`);
    setCache(cacheKey, data, DEFAULT_TTL);
    return data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const fallback = getCache(cacheKey);
    return (fallback as Review[]) || [];
  }
};