import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import BusCard from "../components/BusCard";
import data from "../data/tn-bus-data.json";
import { useAuth } from "../context/AuthContext";

function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("erode_favorites");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  
  const { isAuthenticated } = useAuth();

  const toggle = (busId) => {
    if (!isAuthenticated()) return;
    
    const newFavorites = favorites.includes(busId) 
      ? favorites.filter(id => id !== busId)
      : [...favorites, busId];
    
    setFavorites(newFavorites);
    localStorage.setItem("erode_favorites", JSON.stringify(newFavorites));
  };

  return { favorites, toggle };
}

export default function Dashboard() {
  const [q, setQ] = useState("");
  const [buses, setBuses] = useState(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { favorites, toggle } = useFavorites();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return buses;
    return buses.filter((b) =>
      b.routeName.toLowerCase().includes(term) ||
      b.origin.toLowerCase().includes(term) ||
      b.destination.toLowerCase().includes(term) ||
      b.stops.join(" ").toLowerCase().includes(term)
    );
  }, [q, buses]);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="space-between section">
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <input className="input" style={{ maxWidth: 360 }} placeholder="Search routes, stops..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="section">
          {filtered.map((bus) => (
            <BusCard key={bus.id} bus={bus} onToggleFavorite={toggle} isFavorite={favorites.includes(bus.id)} />
          ))}
          {filtered.length === 0 && <div className="card">No buses found.</div>}
        </div>
      </div>
    </>
  );
}

