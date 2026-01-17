export const authFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include'
    });

    // Session expired or unauthorized
    if (response.status === 401 || response.status === 403) {
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    // Server errors (500, 502, 503, 504)
    if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    // Database connection errors
    if (response.status === 503) {
      throw new Error('Service temporarily unavailable. Please try again.');
    }

    // Bad request
    if (response.status === 400) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Invalid request');
    }

    return response;
  } catch (error) {
    // Network errors (no internet, server down)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};
