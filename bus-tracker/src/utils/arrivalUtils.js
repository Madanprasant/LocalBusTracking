export function getMinutesUntilDeparture(departureTimeHHMM) {
  // departureTimeHHMM in "HH:MM" 24h format, assumes today. If passed time, roll to next day.
  if (!departureTimeHHMM || typeof departureTimeHHMM !== "string") return null;
  const [depH, depM] = departureTimeHHMM.split(":").map(Number);
  if (Number.isNaN(depH) || Number.isNaN(depM)) return null;

  const now = new Date();
  const departure = new Date(now);
  departure.setHours(depH, depM, 0, 0);

  let diffMs = departure.getTime() - now.getTime();
  if (diffMs < 0) {
    // schedule next day
    departure.setDate(departure.getDate() + 1);
    diffMs = departure.getTime() - now.getTime();
  }
  return Math.max(0, Math.round(diffMs / 60000));
}

export function formatTimeRange(departureTimeHHMM, arrivalTimeHHMM) {
  return `${departureTimeHHMM} → ${arrivalTimeHHMM}`;
}
