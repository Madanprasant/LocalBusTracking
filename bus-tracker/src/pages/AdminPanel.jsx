import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { busAPI } from "../services/api";

export default function AdminPanel() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: "",
    routeName: "",
    origin: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    frequencyMins: 10,
    fare: 10,
    operator: "TNSTC",
    stops: ""
  });

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await busAPI.getAll();
        setRoutes(response.data);
      } catch (error) {
        setError("Failed to load buses");
        console.error('Failed to fetch buses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  const isEdit = useMemo(() => routes.some((r) => r.id === form.id), [routes, form.id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    try {
      const payload = {
        ...form,
        frequencyMins: Number(form.frequencyMins) || 10,
        fare: Number(form.fare) || 10,
        stops: (form.stops || "").split(",").map((s) => s.trim()).filter(Boolean).map(name => ({
          name,
          coordinates: { lat: 11.3100, lng: 77.6300 } // Default coordinates, should be updated
        }))
      };

      if (isEdit) {
        await busAPI.update(form.id, payload);
        setRoutes(prev => prev.map(r => r.id === form.id ? { ...r, ...payload } : r));
      } else {
        const response = await busAPI.create(payload);
        setRoutes(prev => [response.data, ...prev]);
      }
      
      setForm({
        id: "",
        routeName: "",
        origin: "",
        destination: "",
        departureTime: "",
        arrivalTime: "",
        frequencyMins: 10,
        fare: 10,
        operator: "TNSTC",
        stops: ""
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save bus");
    }
  }

  async function handleDelete(busId) {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;
    
    try {
      await busAPI.delete(busId);
      setRoutes(prev => prev.filter(r => r.id !== busId));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete bus");
    }
  }

  function handleEdit(route) {
    setForm({
      ...route,
      stops: route.stops.map(s => s.name).join(", ")
    });
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="center">Loading admin panel...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Admin Panel</h2>
        
        {error && (
          <div className="card section" style={{ color: "#ff6b6b" }}>
            {error}
          </div>
        )}
        
        <form className="card section" onSubmit={handleSubmit}>
          <div className="grid">
            <input className="input" name="id" placeholder="ID (e.g., ERD-999)" value={form.id} onChange={handleChange} required />
            <input className="input" name="routeName" placeholder="Route name" value={form.routeName} onChange={handleChange} required />
            <input className="input" name="origin" placeholder="Origin" value={form.origin} onChange={handleChange} required />
            <input className="input" name="destination" placeholder="Destination" value={form.destination} onChange={handleChange} required />
            <input className="input" name="departureTime" placeholder="Departure HH:MM" value={form.departureTime} onChange={handleChange} required />
            <input className="input" name="arrivalTime" placeholder="Arrival HH:MM" value={form.arrivalTime} onChange={handleChange} required />
            <input className="input" name="frequencyMins" placeholder="Frequency (mins)" value={form.frequencyMins} onChange={handleChange} />
            <input className="input" name="fare" placeholder="Fare ₹" value={form.fare} onChange={handleChange} />
            <input className="input" name="operator" placeholder="Operator" value={form.operator} onChange={handleChange} />
          </div>
          <div className="section">
            <textarea className="input" name="stops" placeholder="Stops (comma separated)" value={form.stops} onChange={handleChange} rows={3} />
          </div>
          <div className="row">
            <button className="btn primary" type="submit">{isEdit ? "Update" : "Add"} Route</button>
            {isEdit && (
              <button className="btn" type="button" onClick={() => setForm({
                id: "",
                routeName: "",
                origin: "",
                destination: "",
                departureTime: "",
                arrivalTime: "",
                frequencyMins: 10,
                fare: 10,
                operator: "TNSTC",
                stops: ""
              })}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="section">
          <h3 style={{ marginTop: 0 }}>Bus Routes</h3>
          {routes.map((r) => (
            <div key={r.id} className="card" style={{ marginBottom: 10 }}>
              <div className="space-between">
                <div>
                  <strong>{r.routeName}</strong>
                  <div className="sub">{r.origin} → {r.destination}</div>
                  <div className="sub">Fare: ₹{r.fare} | Frequency: {r.frequencyMins}min</div>
                </div>
                <div className="row">
                  <button className="btn" onClick={() => handleEdit(r)}>Edit</button>
                  <button className="btn" onClick={() => handleDelete(r.id)} style={{ background: "#ff6b6b", color: "white" }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {routes.length === 0 && <div className="card">No buses found.</div>}
        </div>
      </div>
    </>
  );
}
