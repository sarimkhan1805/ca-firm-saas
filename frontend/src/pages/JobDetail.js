/**
 * JobDetail - view a single job, change status, upload/view documents.
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { supabase } from "../supabaseClient";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const STATUSES = ["pending", "in_progress", "review", "completed"];

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Helper to get auth token
  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  // Load job details
  const loadJob = async () => {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/jobs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setJob(res.data);
  };

  // Load documents linked to this job
  const loadDocs = async () => {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/documents/job/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDocuments(res.data);
  };

  useEffect(() => {
    loadJob();
    loadDocs();
  }, [id]);

  // Update job status
  const handleStatusChange = async (newStatus) => {
    const token = await getToken();
    await axios.patch(
      `${API_URL}/jobs/${id}`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadJob();
  };

  // Upload file to Supabase Storage via backend
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("job_id", id);
      formData.append("file", file);

      await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      // Reset input element
      document.getElementById("file-input").value = "";
      loadDocs();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  if (!job) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-2">{job.title}</h2>
        <p className="text-gray-600 mb-6">{job.description}</p>

        {/* Status changer */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <label className="text-sm font-semibold">Status: </label>
          <select
            value={job.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="ml-2 p-1 border rounded"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          {job.due_date && (
            <span className="ml-6 text-sm text-gray-600">
              Due: {job.due_date}
            </span>
          )}
        </div>

        {/* Upload form */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-semibold mb-3">Upload Document</h3>
          <form onSubmit={handleUpload} className="flex gap-3 items-center">
            <input
              id="file-input"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="flex-1"
              required
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>

        {/* Documents list */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Documents ({documents.length})</h3>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
          ) : (
            <ul className="divide-y">
              {documents.map((doc) => (
                <li key={doc.id} className="py-2 flex justify-between items-center">
                  <span className="text-sm">{doc.file_name}</span>
                  <a
                    href={doc.signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
