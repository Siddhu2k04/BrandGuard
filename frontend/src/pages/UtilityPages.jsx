import React, { useEffect, useState } from "react";
import {
  BookOpen,
  CloudUpload,
  ChartNoAxesColumn,
  FileText,
  Settings as SettingsIcon,
} from "lucide-react";
import AppShell from "../components/AppShell";
import { useAuth } from "../contexts/AuthContext";
import { companyAPI } from "../api/company";

export function DashboardPage({ role, navigate, onLogout }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    contents: 0,
    guidelines: 0,
    employees: 0,
  });

  useEffect(() => {
    if (role === "Company") {
      companyAPI
        .listEmployees()
        .then((employees) => {
          setStats((prev) => ({ ...prev, employees: employees.length }));
        })
        .catch(() => {});
    }
  }, [role]);

  const cards =
    role === "Company"
      ? [
          {
            title: "Company Guidelines",
            body: "Upload or update the shared guidelines PDF.",
            icon: BookOpen,
            action: "Company Guidelines",
            button: "Manage Guidelines",
          },
          {
            title: "Content Analytics",
            body: "Review the latest employee content analysis.",
            icon: ChartNoAxesColumn,
            action: "Analytics",
            button: "View Analysis",
          },
        ]
      : [
          {
            title: "Upload Content",
            body: "Submit an image, text, or link for a preliminary review.",
            icon: CloudUpload,
            action: "Upload Content",
            button: "Upload Content",
          },
          {
            title: "Analysis Results",
            body: "View the latest uploaded content and detected text-level issues.",
            icon: ChartNoAxesColumn,
            action: "Analytics",
            button: "View Results",
          },
        ];
  return (
    <AppShell
      active="Dashboard"
      role={role}
      navigate={navigate}
      onLogout={onLogout}
    >
      <div className="page-heading">
        <h1>Dashboard</h1>
        <p>Welcome to BrandGuard. Content · Trust · Grow.</p>
      </div>
      <div className="stat-grid">
        <div className="panel stat-card">
          <FileText />
          <span>Content uploads saved</span>
          <strong>{stats.contents}</strong>
        </div>
        <div className="panel stat-card">
          <BookOpen />
          <span>Guidelines documents</span>
          <strong>{stats.guidelines}</strong>
        </div>
        {role === "Company" && (
          <div className="panel stat-card">
            <SettingsIcon />
            <span>Company employees</span>
            <strong>{stats.employees}</strong>
          </div>
        )}
      </div>
      <div className="utility-grid">
        {cards.map(({ title, body, icon: Icon, action, button }) => (
          <section className="panel utility-card" key={title}>
            <span className="utility-icon">
              <Icon size={25} />
            </span>
            <h2>{title}</h2>
            <p>{body}</p>
            <button className="primary-button" onClick={() => navigate(action)}>
              {button}
            </button>
          </section>
        ))}
      </div>
    </AppShell>
  );
}

export function SettingsPage({ role, navigate, onLogout }) {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (user?.company_id) {
      companyAPI
        .getCompany()
        .then((data) => setCompany(data))
        .catch(() => {});
    }
  }, [user]);

  return (
    <AppShell
      active="Settings"
      role={role}
      navigate={navigate}
      onLogout={onLogout}
    >
      <div className="page-heading">
        <h1>Settings</h1>
        <p>Account information for BrandGuard.</p>
      </div>
      <section className="panel settings-panel">
        <span className="utility-icon">
          <SettingsIcon size={25} />
        </span>
        <h2>Account Settings</h2>
        <div className="settings-row">
          <span>Role</span>
          <strong>
            {user?.role === "company_admin"
              ? "Company Administrator"
              : "Employee"}
          </strong>
        </div>
        <div className="settings-row">
          <span>Email</span>
          <strong>{user?.email || "Not provided"}</strong>
        </div>
        <div className="settings-row">
          <span>Full Name</span>
          <strong>{user?.full_name || "Not provided"}</strong>
        </div>
        <div className="settings-row">
          <span>Company</span>
          <strong>{company?.name || "Not assigned"}</strong>
        </div>
        <button className="primary-button" onClick={onLogout}>
          Log out
        </button>
      </section>
    </AppShell>
  );
}
