import React, { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useLang } from "./i18n";
import { getAuthToken, removeAuthToken } from "./api";

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

function PrivateRoute({ children }) {
  const token = getAuthToken();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  // TODO: fetch user and check is_admin from backend and context
  const token = getAuthToken();
  // // ideally fetch user profile and see is_admin
  if (!token) return <Navigate to="/login" replace />;
  // just for demo always show:
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
        </Routes>
      </main>
    </div>
  );
}

export default App;
