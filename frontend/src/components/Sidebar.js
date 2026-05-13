/**
 * Sidebar - main navigation visible inside the dashboard layout.
 */
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-1">CA Firm SaaS</h1>
      <p className="text-xs text-slate-400 mb-6">
        {profile?.full_name} ({profile?.role})
      </p>

      <nav className="flex flex-col gap-2 flex-1">
        <Link to="/dashboard" className="hover:bg-slate-700 p-2 rounded">
          🏠 Dashboard
        </Link>
        <Link to="/jobs" className="hover:bg-slate-700 p-2 rounded">
          📋 Job Board
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto bg-red-600 hover:bg-red-700 p-2 rounded"
      >
        Logout
      </button>
    </aside>
  );
}
