import { useState } from "react";
import AlertCard from "./AlertCard";
import MapView from "./MapView";
import { getMinutesUntilDeparture, formatTimeRange } from "../utils/arrivalUtils";

export default function BusCard({ bus, onToggleFavorite, isFavorite }) {
  const [showMap, setShowMap] = useState(false);
  const minutes = getMinutesUntilDeparture(bus.departureTime);
  
  return (
    <div className="bus-card">
      <div className="bus-card-header">
        <div>
          <h3 className="route">{bus.routeName}</h3>
          <div className="sub">{bus.origin} → {bus.destination}</div>
        </div>
        <button className={isFavorite ? "fav-btn active" : "fav-btn"} onClick={() => onToggleFavorite(bus.id)}>
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
      <div className="bus-meta">
        <div><strong>Time:</strong> {formatTimeRange(bus.departureTime, bus.arrivalTime)} ({bus.frequencyMins}m freq)</div>
        <div><strong>Fare:</strong> ₹{bus.fare}</div>
        <div><strong>Operator:</strong> {bus.operator}</div>
      </div>
      <AlertCard minutes={minutes} />
      <div className="stops">
        <strong>Stops:</strong> <span>{bus.stops.map(s => s.name).join(", ")}</span>
      </div>
      <div className="bus-actions">
        <button className="btn" onClick={() => setShowMap(!showMap)}>
          {showMap ? "Hide Route" : "View Route"}
        </button>
      </div>
      {showMap && <MapView bus={bus} />}
    </div>
  );
}


