/**
 * JobCard - displays a single job summary used inside columns of the job board.
 */
import { Link } from "react-router-dom";

const statusColors = {
  pending: "bg-gray-200 text-gray-800",
  in_progress: "bg-blue-200 text-blue-800",
  review: "bg-yellow-200 text-yellow-800",
  completed: "bg-green-200 text-green-800",
};

export default function JobCard({ job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white p-3 rounded shadow hover:shadow-md transition"
    >
      <h3 className="font-semibold text-sm">{job.title}</h3>
      <p className="text-xs text-gray-500 mt-1 truncate">{job.description}</p>
      <span
        className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${
          statusColors[job.status] || ""
        }`}
      >
        {job.status}
      </span>
    </Link>
  );
}
