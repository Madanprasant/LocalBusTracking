import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BusCard from "../components/BusCard";
import { favoritesAPI } from "../services/api";

export default function Favorites() {
  const [favoriteBuses, setFavoriteBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await favoritesAPI.getAll();
        setFavoriteBuses(response.data);
      } catch (error) {
        setError("Failed to load favorites");
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const toggle = async (busId) => {
    try {
      await favoritesAPI.remove(busId);
      setFavoriteBuses(prev => prev.filter(bus => bus.id !== busId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="center">Loading favorites...</div>
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
        <h2>Favorites</h2>
        <div className="section">
          {favoriteBuses.map((bus) => (
            <BusCard key={bus.id} bus={bus} onToggleFavorite={toggle} isFavorite={true} />
          ))}
          {favoriteBuses.length === 0 && <div className="card">No favorite buses yet.</div>}
        </div>
      </div>
    </>
  );
}


