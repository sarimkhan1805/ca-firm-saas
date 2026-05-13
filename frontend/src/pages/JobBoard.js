/**
 * JobBoard - Kanban-style board with 4 columns.
 * Firm Admin can create new jobs from a modal/form here.
 */
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import JobCard from "../components/JobCard";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const STATUSES = ["pending", "in_progress", "review", "completed"];

export default function JobBoard() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    assigned_to: "",
    client_id: "",
    due_date: "",
  });

  // Load jobs from backend
  const loadJobs = async () => {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    const res = await axios.get(`${API_URL}/jobs/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setJobs(res.data);
  };

  // Load team members (for assign dropdown)
  const loadTeam = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, role");
    setTeamMembers(data || []);
  };

  useEffect(() => {
    loadJobs();
    loadTeam();
  }, []);

  // Create job
  const handleCreate = async (e) => {
    e.preventDefault();
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;

    const payload = { ...newJob };
    // Remove empty strings (backend expects null)
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });

    await axios.post(`${API_URL}/jobs/`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setShowForm(false);
    setNewJob({ title: "", description: "", assigned_to: "", client_id: "", due_date: "" });
    loadJobs();
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Job Board</h2>
          {profile?.role === "firm_admin" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showForm ? "Cancel" : "+ New Job"}
            </button>
          )}
        </div>

        {/* New Job Form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-3"
          >
            <input
              placeholder="Job title"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              required
              className="p-2 border rounded col-span-2"
            />
            <textarea
              placeholder="Description"
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              className="p-2 border rounded col-span-2"
            />
            <select
              value={newJob.assigned_to}
              onChange={(e) => setNewJob({ ...newJob, assigned_to: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Assign to team member...</option>
              {teamMembers
                .filter((t) => t.role === "team_member")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
            </select>
            <select
              value={newJob.client_id}
              onChange={(e) => setNewJob({ ...newJob, client_id: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Select client...</option>
              {teamMembers
                .filter((t) => t.role === "client")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
            </select>
            <input
              type="date"
              value={newJob.due_date}
              onChange={(e) => setNewJob({ ...newJob, due_date: e.target.value })}
              className="p-2 border rounded"
            />
            <button
              type="submit"
              className="bg-green-600 text-white p-2 rounded col-span-2"
            >
              Create Job
            </button>
          </form>
        )}

        {/* Kanban columns */}
        <div className="grid grid-cols-4 gap-4">
          {STATUSES.map((status) => (
            <div key={status} className="bg-gray-100 p-3 rounded min-h-[400px]">
              <h3 className="font-semibold capitalize mb-3">
                {status.replace("_", " ")} (
                {jobs.filter((j) => j.status === status).length})
              </h3>
              <div className="flex flex-col gap-2">
                {jobs
                  .filter((j) => j.status === status)
                  .map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
