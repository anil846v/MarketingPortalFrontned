import { useState } from 'react';

export const useApiError = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiCall = async (apiFunction) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await apiFunction();
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (err.message.includes('Network error')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (err.message.includes('Server error')) {
        errorMessage = 'Server is experiencing issues. Please try again later.';
      } else if (err.message.includes('Service temporarily unavailable')) {
        errorMessage = 'Service is temporarily down. Please try again in a few minutes.';
      } else if (err.message.includes('Session expired')) {
        errorMessage = 'Your session has expired. Redirecting to login...';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return { error, isLoading, handleApiCall, clearError };
};
