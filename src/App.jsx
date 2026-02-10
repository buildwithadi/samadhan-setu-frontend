import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import { ROLES } from "./utils/constants";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CitizenHome from "./pages/citizen/CitizenHome";
import CMDashboard from "./pages/dashboards/CMDashboard";
import DeptDashboard from "./pages/dashboards/DeptDashboard";

// --- MIDDLEWARE COMPONENT (Like a Django Decorator) ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="p-10 text-center">Loading auth state...</div>;

  // 1. Not Logged In? -> Go to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Wrong Role? -> Go to their allowed home
  // (e.g. A Citizen trying to access CM Dashboard)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on their actual role
    if (user.role === ROLES.CITIZEN) return <Navigate to="/citizen/home" />;
    if (user.role === ROLES.ADMIN_CM) return <Navigate to="/dashboard/cm" />;
    return <Navigate to="/dashboard/dept" />;
  }

  // 3. Allowed? -> Render the Page
  return children;
};

// --- MAIN APP COMPONENT ---
function App() {
  const { user } = useAuth();

  return (
    <>
      {/* Global Notification Toaster */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ROOT REDIRECT LOGIC:
            If logged in -> Go to Dashboard.
            If not -> Go to Login.
        */}
        <Route
          path="/"
          element={
            user ? (
              user.role === ROLES.CITIZEN ? (
                <Navigate to="/citizen/home" />
              ) : user.role === ROLES.ADMIN_CM ? (
                <Navigate to="/dashboard/cm" />
              ) : (
                <Navigate to="/dashboard/dept" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* PROTECTED ROUTE: CITIZEN */}
        <Route
          path="/citizen/home"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
              <CitizenHome />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED ROUTE: CHIEF MINISTER (L1) */}
        <Route
          path="/dashboard/cm"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN_CM]}>
              <CMDashboard />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED ROUTE: DEPT HEADS (L2 & L3) */}
        <Route
          path="/dashboard/dept"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HEAD_DEPT, ROLES.HEAD_SUB]}>
              <DeptDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 CATCH ALL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
