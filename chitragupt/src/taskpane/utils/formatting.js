/**
 * Formats a date object to a readable time string
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string (e.g., "02:30 PM")
 */
export const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

