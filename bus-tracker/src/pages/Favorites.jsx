import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BusCard from "../components/BusCard";
import data from "../data/tn-bus-data.json";

export default function Favorites() {
  const [favoriteBuses, setFavoriteBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem("erode_favorites") || "[]");
        const favBuses = data.filter(bus => favorites.includes(bus.id));
        setFavoriteBuses(favBuses);
      } catch (error) {
        setError("Failed to load favorites");
        console.error('Failed to load favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  const toggle = (busId) => {
    try {
      const favorites = JSON.parse(localStorage.getItem("erode_favorites") || "[]");
      const newFavorites = favorites.filter(id => id !== busId);
      localStorage.setItem("erode_favorites", JSON.stringify(newFavorites));
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


