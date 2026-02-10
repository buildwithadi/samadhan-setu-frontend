import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API, { fetchProfile } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Validate token with backend
      fetchProfile()
        .then(({ data }) => setUser(data)) // Adjust if your backend wraps user in data.user
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", data.access_token);
    setUser(data.user);

    // Redirect based on Role
    if (data.user.role === "CITIZEN") navigate("/citizen/home");
    else if (data.user.role === "ADMIN_CM") navigate("/dashboard/cm");
    else navigate("/dashboard/dept"); // Dept Heads
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
