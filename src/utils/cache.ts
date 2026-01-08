export const setCache = (key: string, data: any, ttlMs = 1000 * 60 * 60) => {
  try {
    const record = {
      data,
      expiry: Date.now() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(record));
  } catch (err) {
  }
};

export const getCache = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (!record || typeof record !== 'object') {
      localStorage.removeItem(key);
      return null;
    }
    if (record.expiry && Date.now() > record.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return record.data;
  } catch (err) {
    // parsing or access error
    try {
      localStorage.removeItem(key);
    } catch {}
    return null;
  }
};

export const removeCache = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {}
};

export const clearAllCache = () => {
  try {
    localStorage.clear();
  } catch {}
};