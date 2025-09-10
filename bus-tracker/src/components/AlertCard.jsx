export default function AlertCard({ minutes }) {
  if (minutes == null) return null;
  const label = minutes === 0 ? "Bus is departing now" : `Bus arriving in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  return (
    <div className="alert">
      <span role="img" aria-label="bus">🚌</span>
      <span>{label}</span>
    </div>
  );
}


