/**
 * Dashboard - landing page after login.
 * Shows quick stats (count of jobs by status).
 */
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ pending: 0, in_progress: 0, review: 0, completed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from("jobs").select("status");
      if (!data) return;
      const counts = { pending: 0, in_progress: 0, review: 0, completed: 0 };
      data.forEach((j) => {
        if (counts[j.status] !== undefined) counts[j.status]++;
      });
      setStats(counts);
    };
    fetchStats();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-2">
          Welcome, {profile?.full_name} 👋
        </h2>
        <p className="text-gray-600 mb-8">Here's your firm overview.</p>

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 uppercase">
                {key.replace("_", " ")}
              </p>
              <p className="text-3xl font-bold mt-2">{value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
