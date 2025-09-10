import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoUrl from "../assets/logo.png";
import "../index.css";

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/dashboard" className="brand">
          <img src={logoUrl} alt="Erode Bus Tracker" className="brand-logo" />
          <span>Erode Local Bus Tracker</span>
        </Link>
      </div>
      <div className="nav-right">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
        
        {isAuthenticated() && (
          <>
            <NavLink to="/favorites" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Favorites</NavLink>
            {isAdmin() && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Admin</NavLink>
            )}
          </>
        )}
        
        {isAuthenticated() ? (
          <div className="nav-user">
            <span className="nav-username">Welcome, {user?.username}</span>
            <button className="btn" onClick={logout} style={{ marginLeft: "10px", padding: "4px 8px", fontSize: "12px" }}>
              Logout
            </button>
          </div>
        ) : (
          <NavLink to="/" className="nav-link">Login</NavLink>
        )}
      </div>
    </nav>
  );
}


