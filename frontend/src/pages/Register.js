/**
 * Register page - fixed version
 * Handles FastAPI 422 validation errors and general errors properly
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "firm_admin",
  });
  const [error, setError] = useState("");   // Always a STRING
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/register`, form);
      alert("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      // FastAPI 422 returns: { detail: [ {loc, msg, type, input, ctx} ] }
      // FastAPI 400 returns: { detail: "some string" }
      // We must always convert to a string before setting state

      const detail = err.response?.data?.detail;

      if (!detail) {
        // Network error or no response
        setError("Cannot connect to server. Is the backend running on port 8000?");
      } else if (typeof detail === "string") {
        // Normal error string from backend
        setError(detail);
      } else if (Array.isArray(detail)) {
        // FastAPI 422 Pydantic validation error — array of error objects
        // Extract the human-readable message from each error
        const messages = detail.map((d) => {
          const field = d.loc ? d.loc[d.loc.length - 1] : "field";
          return `${field}: ${d.msg}`;
        });
        setError(messages.join(" | "));
      } else {
        // Fallback — stringify whatever we got
        setError(JSON.stringify(detail));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {/* error is always a string now — safe to render */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded mb-3"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded mb-3"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 chars)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full p-2 border rounded mb-3"
        />

        <label className="text-sm block mb-1 font-medium">Select Role</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="firm_admin">Firm Admin (Onshore)</option>
          <option value="team_member">Team Member (Offshore)</option>
          <option value="client">Client</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm mt-4">
          Have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
