// In development, the Vite dev server proxies all /api requests to localhost:5000
// (see vite.config.js → server.proxy). This means the browser never makes a
// cross-origin request regardless of which network the machine is on.
//
// In production (built app served from the backend), the backend and frontend share
// the same origin so no CORS is involved either.
//
// If you ever need to point at a remote server, set VITE_API_URL in .env.local
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Enhanced fetch with retry logic and built-in error handling
 */
export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 500) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || `Request failed with status ${response.status}`,
        data: errorData
      };
    }

    return await response.json();
  } catch (err) {
    if (retries > 0 && (!err.status || err.status >= 500)) {
      console.warn(`Retrying request to ${url}. Out of ${retries} attempts left.`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
};
