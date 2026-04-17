export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
