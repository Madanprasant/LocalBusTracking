import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import BusCard from "../components/BusCard";
import { useAuth } from "../context/AuthContext";
import { getBuses } from "../services/busService";

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
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { favorites, toggle } = useFavorites();

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        console.log('Fetching buses from API...');
        const data = await getBuses();
        console.log('API Response:', data);
        console.log('Data type:', Array.isArray(data) ? 'Array' : typeof data);
        console.log('Number of buses:', Array.isArray(data) ? data.length : 'N/A');
        
        if (Array.isArray(data)) {
          setBuses(data);
          setError("");
        } else {
          console.error('Unexpected response format:', data);
          setError("Received invalid data format from server");
        }
      } catch (err) {
        console.error('Error fetching buses:', err);
        setError(`Failed to load bus data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  const filtered = useMemo(() => {
    console.log('Filtering buses. Current buses:', buses);
    if (!Array.isArray(buses)) {
      console.error('Buses is not an array:', buses);
      return [];
    }
    
    const term = q.trim().toLowerCase();
    if (!term) return buses;
    
    return buses.filter((b) => {
      if (!b) return false;
      return (
        (b.routeName && b.routeName.toLowerCase().includes(term)) ||
        (b.origin && b.origin.toLowerCase().includes(term)) ||
        (b.destination && b.destination.toLowerCase().includes(term)) ||
        (Array.isArray(b.stops) && b.stops.some(stop => 
          typeof stop === 'string' ? stop.toLowerCase().includes(term) :
          stop && stop.name && stop.name.toLowerCase().includes(term)
        ))
      );
    });
  }, [q, buses]);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="space-between section">
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <input 
            className="input" 
            style={{ maxWidth: 360 }} 
            placeholder="Search routes, stops..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            disabled={loading}
          />
        </div>
        
        {loading ? (
          <div className="section">
            <div className="card">Loading bus data...</div>
          </div>
        ) : error ? (
          <div className="section">
            <div className="card" style={{ color: '#ff6b6b' }}>{error}</div>
          </div>
        ) : (
          <div className="section">
            {filtered.length > 0 ? (
              filtered.map((bus) => (
                <BusCard 
                  key={bus.id} 
                  bus={bus} 
                  onToggleFavorite={toggle} 
                  isFavorite={favorites.includes(bus.id)} 
                />
              ))
            ) : (
              <div className="card">
                {q ? 'No matching buses found. Try a different search term.' : 'No bus routes available.'}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

