export const authFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      cache: "no-store" // 🚨 prevents browser from caching validate responses
    });

    if (response.status === 401 || response.status === 403) {
      // 🔥 Broadcast session expiry to entire app
      window.dispatchEvent(new Event("session-expired"));
      throw new Error("UNAUTHORIZED");
    }

    if (response.status >= 500) {
      throw new Error("Server error");
    }

    return response;
  } catch (error) {
    if (error.name === "TypeError") {
      throw new Error("Network error");
    }
    throw error;
  }
};
