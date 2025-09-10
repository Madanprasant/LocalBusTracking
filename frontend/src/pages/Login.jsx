import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated()) {
    navigate("/dashboard");
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = isSignup 
        ? await signup(username, password)
        : await login(username, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="center">
        <form onSubmit={onSubmit} className="card" style={{ minWidth: 320 }}>
          <h2 style={{ marginTop: 0 }}>{isSignup ? "Sign Up" : "Welcome"}</h2>
          <p style={{ color: "#8aa0b5", marginTop: 0 }}>
            {isSignup ? "Create account to track buses" : "Login to track local buses"}
          </p>
          
          {error && (
            <div className="section" style={{ color: "#ff6b6b", fontSize: "14px" }}>
              {error}
            </div>
          )}
          
          <div className="section">
            <input 
              className="input" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="section">
            <input 
              className="input" 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="section">
            <button 
              className="btn primary" 
              type="submit" 
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Loading..." : (isSignup ? "Sign Up" : "Login")}
            </button>
          </div>
          <div className="section" style={{ textAlign: "center" }}>
            <button 
              type="button"
              className="btn"
              onClick={() => setIsSignup(!isSignup)}
              style={{ background: "transparent", border: "none", color: "#8aa0b5" }}
            >
              {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
