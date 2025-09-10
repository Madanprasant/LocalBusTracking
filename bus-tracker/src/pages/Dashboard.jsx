import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import BusCard from "../components/BusCard";
import { busAPI, favoritesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchFavorites = async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.data.map(bus => bus.id));
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (busId) => {
    if (!isAuthenticated()) return;
    
    try {
      const isFavorite = favorites.includes(busId);
      if (isFavorite) {
        await favoritesAPI.remove(busId);
        setFavorites(prev => prev.filter(id => id !== busId));
      } else {
        await favoritesAPI.add(busId);
        setFavorites(prev => [...prev, busId]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated()]);

  return { favorites, toggle, loading };
}

export default function Dashboard() {
  const [q, setQ] = useState("");
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { favorites, toggle } = useFavorites();

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await busAPI.getAll();
        setBuses(response.data);
      } catch (error) {
        setError("Failed to load buses");
        console.error('Failed to fetch buses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return buses;
    return buses.filter((b) =>
      b.routeName.toLowerCase().includes(term) ||
      b.origin.toLowerCase().includes(term) ||
      b.destination.toLowerCase().includes(term) ||
      b.stops.map(s => s.name).join(" ").toLowerCase().includes(term)
    );
  }, [q, buses]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="center">Loading buses...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="center">
          <div className="card" style={{ color: "#ff6b6b" }}>
            {error}
          </div>
        </div>
      </>
    );
  }

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

