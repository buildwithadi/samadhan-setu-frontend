import axios from "axios";

// In Vite, we use import.meta.env to access environment variables.
// The VITE_ prefix is mandatory for security reasons to expose variables to the client.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

// Request Interceptor
// Automatically adds the JWT Token to the 'Authorization' header for every request.
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// --- AUTHENTICATION ENDPOINTS ---
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const fetchProfile = () => API.get("/users/profile");

// --- COMPLAINT ENDPOINTS ---
export const createComplaint = (data) => API.post("/complaints", data);
export const fetchComplaints = () => API.get("/complaints");
export const updateComplaintStatus = (id, data) =>
  API.patch(`/complaints/${id}/status`, data);

// Filter Helper
export const fetchFilteredComplaints = (dept, sub) => {
  const params = new URLSearchParams();
  if (dept) params.append("dept", dept);
  if (sub) params.append("sub", sub);
  return API.get(`/complaints/filter?${params.toString()}`);
};

// --- OFFICIALS & USER MANAGEMENT ---
export const fetchUsersByRole = (role) => API.get(`/users/role/${role}`);
export const fetchOfficials = () => API.get("/users/officials");

export default API;
