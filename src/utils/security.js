// XSS Protection - Sanitize user inputs
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .slice(0, 255); // Limit length
};

export const validateUsername = (username) => {
  const sanitized = sanitizeInput(username);
  if (sanitized.length < 3 || sanitized.length > 100) {
    throw new Error('Username must be between 3 and 100 characters');
  }
  return sanitized;
};

export const validatePassword = (password) => {
  if (password.length < 6 || password.length > 100) {
    throw new Error('Password must be between 6 and 100 characters');
  }
  return password;
};
