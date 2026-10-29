import React from "react";
import {
  House,
  CloudUpload,
  BookOpen,
  ChartNoAxesColumn,
  Settings,
  LogOut,
} from "lucide-react";
import Brand from "./Brand";
import { useAuth } from "../contexts/AuthContext";

const companyItems = [
  ["Dashboard", House],
  ["Company Guidelines", BookOpen],
  ["Analytics", ChartNoAxesColumn],
  ["Settings", Settings],
];
const employeeItems = [
  ["Dashboard", House],
  ["Upload Content", CloudUpload],
  ["Company Guidelines", BookOpen],
  ["Analytics", ChartNoAxesColumn],
  ["Settings", Settings],
];

export default function Sidebar({ active, role, navigate, onLogout }) {
  const { user } = useAuth();
  const items = role === "Company" ? companyItems : employeeItems;

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : role === "Company"
      ? "C"
      : "E";
  const userRole =
    user?.role === "company_admin" ? "Company Admin" : "Employee";

  return (
    <aside className="sidebar">
      <Brand />
      <nav className="nav-list" aria-label="Main navigation">
        {items.map(([label, Icon]) => (
          <button
            key={label}
            className={`nav-item ${active === label ? "active" : ""}`}
            onClick={() => navigate(label)}
          >
            <Icon size={22} strokeWidth={2.1} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="mini-avatar">{userInitial}</div>
        <div className="sidebar-user">
          <b>{user?.full_name || userRole}</b>
          <small>{user?.email || "User"}</small>
        </div>
        <button
          className="sidebar-logout"
          title="Log out"
          aria-label="Log out"
          onClick={onLogout}
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
