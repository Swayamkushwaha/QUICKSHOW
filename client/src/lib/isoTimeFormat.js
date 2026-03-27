const isoTimeFormat = (time) => {
  if (!time) return "";

  // If it's already a short time string (HH:mm), return as is
  if (typeof time === 'string' && time.length <= 5) {
    return time;
  }

  const date = new Date(time);
  if (isNaN(date.getTime())) return time;

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default isoTimeFormat;