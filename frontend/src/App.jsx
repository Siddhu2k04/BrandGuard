import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import GuidelinesPage from "./pages/GuidelinesPage";
import UploadPage from "./pages/UploadPage";
import AnalysisPage from "./pages/AnalysisPage";
import { DashboardPage, SettingsPage } from "./pages/UtilityPages";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./styles.css";

function AppContent() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [page, setPage] = useState("Login");
  const [contentId, setContentId] = useState(
    () => sessionStorage.getItem("bg-content-id") || "",
  );

  const navigate = (destination) => {
    if (destination === "Login") return logout();
    if (destination === "Dashboard") return setPage("Dashboard");
    if (destination === "Company Guidelines")
      return setPage("Company Guidelines");
    if (destination === "Upload Content") return setPage("Upload Content");
    if (destination === "Analytics") return setPage("Analysis Results");
    if (destination === "Settings") return setPage("Settings");
    setPage(destination);
  };

  const onAnalyze = (item) => {
    setContentId(item.id);
    sessionStorage.setItem("bg-content-id", item.id);
    setPage("Analysis Results");
  };

  const handleLogin = ({ role: selectedRole }) => {
    setPage(
      selectedRole === "Company" ? "Company Guidelines" : "Upload Content",
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const role = user?.role === "company_admin" ? "Company" : "Employee";

  if (page === "Company Guidelines")
    return <GuidelinesPage role={role} navigate={navigate} onLogout={logout} />;
  if (page === "Upload Content")
    return (
      <UploadPage
        role={role}
        navigate={navigate}
        onLogout={logout}
        onAnalyze={onAnalyze}
      />
    );
  if (page === "Analysis Results")
    return (
      <AnalysisPage
        role={role}
        navigate={navigate}
        onLogout={logout}
        contentId={contentId}
      />
    );
  if (page === "Dashboard")
    return <DashboardPage role={role} navigate={navigate} onLogout={logout} />;
  return <SettingsPage role={role} navigate={navigate} onLogout={logout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
