import React, { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useLang } from "./i18n";
import { getAuthToken, removeAuthToken } from "./api";
import { getUserRoleInfo, fetchUserRoleInfo } from "./auth";

import TopNavBar from "./components/TopNavBar";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import UserApplications from "./pages/UserApplications";
import ApplicationForm from "./pages/ApplicationForm";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";
import DocumentUpload from "./pages/DocumentUpload";
import Downloads from "./pages/Downloads";
import NotFoundPage from "./pages/NotFoundPage";
import UserManagement from "./pages/UserManagement";
import CertificateVerificationPage from "./pages/CertificateVerificationPage";

function PrivateRoute({ children }) {
  const token = getAuthToken();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token = getAuthToken();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkRole() {
      if (!token) {
        if (mounted) setIsAdmin(false);
        setChecking(false);
        return;
      }
      const { isAdmin: adminDecoded } = getUserRoleInfo();
      if (adminDecoded) {
        setIsAdmin(true);
        setChecking(false);
        return;
      }
      // fallback to API check
      try {
        const { isAdmin: adminApi } = await fetchUserRoleInfo(true);
        if (mounted) setIsAdmin(adminApi);
      } catch {
        if (mounted) setIsAdmin(false);
      }
      if (mounted) setChecking(false);
    }
    checkRole();
    return () => { mounted = false };
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;
  if (checking) return <div style={{ padding: 60, textAlign: "center" }}>Checking permissions…</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

// PUBLIC_INTERFACE
function App() {
  // Theme in local state
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    removeAuthToken();
    navigate("/login");
  };

  // Layout with top nav, sidebar, main content
  return (
    <div className="App" style={{ minHeight: "100vh" }}>
      <TopNavBar
        toggleTheme={toggleTheme}
        theme={theme}
        onSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar
        open={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
        handleLogout={handleLogout}
      />
      <main style={{ marginLeft: sidebarOpen ? 200 : 0, paddingTop: 60 }}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/applications"
            element={
              <PrivateRoute>
                <UserApplications />
              </PrivateRoute>
            }
          />
          <Route
            path="/apply"
            element={
              <PrivateRoute>
                <ApplicationForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <DocumentUpload />
              </PrivateRoute>
            }
          />
          <Route
            path="/downloads"
            element={
              <PrivateRoute>
                <Downloads />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/verify"
            element={<CertificateVerificationPage />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
