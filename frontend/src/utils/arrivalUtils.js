export function getMinutesUntilDeparture(departureTime) {
  // Handle both string "HH:MM" format and Date objects
  let departureDate;
  
  if (typeof departureTime === 'string') {
    // Handle "HH:MM" string format
    if (!departureTime) return null;
    const [depH, depM] = departureTime.split(":").map(Number);
    if (Number.isNaN(depH) || Number.isNaN(depM)) return null;
    
    const now = new Date();
    departureDate = new Date(now);
    departureDate.setHours(depH, depM, 0, 0);
    
    // If the departure time has already passed today, schedule for tomorrow
    if (departureDate < now) {
      departureDate.setDate(departureDate.getDate() + 1);
    }
  } else if (departureTime instanceof Date) {
    // Handle Date object
    departureDate = new Date(departureTime);
  } else {
    return null;
  }
  
  const now = new Date();
  const diffMs = departureDate.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / 60000));
}

export function formatTimeRange(departureTime, arrivalTime) {
  // Format time from Date objects if provided, otherwise use as is
  const formatTime = (time) => {
    if (time instanceof Date) {
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    return time || '--:--';
  };
  
  return `${formatTime(departureTime)} → ${formatTime(arrivalTime)}`;
}
