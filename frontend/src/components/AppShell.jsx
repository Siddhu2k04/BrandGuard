import React, { useState } from "react";
import { Bell, CircleHelp, ChevronDown, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

export default function AppShell({
  children,
  active,
  role,
  navigate,
  onLogout,
}) {
  const { user } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : role === "Company"
      ? "C"
      : "E";
  const userRole =
    user?.role === "company_admin" ? "Company Admin" : "Employee";

  return (
    <div className="app-layout">
      <div className={`sidebar-wrap ${mobileMenu ? "open" : ""}`}>
        <Sidebar
          active={active}
          role={role}
          navigate={(label) => {
            navigate(label);
            setMobileMenu(false);
          }}
          onLogout={onLogout}
        />
      </div>
      <main className="app-main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu((v) => !v)}
            aria-label="Toggle navigation"
          >
            <Menu size={22} />
          </button>
          <button className="icon-button" aria-label="Notifications">
            <Bell size={21} />
            <i />
          </button>
          <button
            className="icon-button"
            aria-label="Help"
            onClick={() =>
              window.alert("BrandGuard: contact your administrator for help.")
            }
          >
            <CircleHelp size={21} />
          </button>
          <button
            className="profile"
            onClick={onLogout}
            title="Click to log out"
          >
            <span className="avatar">{userInitial}</span>
            <span className="profile-text">
              <b>{user?.full_name || userRole}</b>
              <small>{user?.email || "User"} · Log out</small>
            </span>
            <ChevronDown size={17} />
          </button>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
