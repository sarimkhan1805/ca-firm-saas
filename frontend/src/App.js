/**
 * App.js - Main routing setup (fixed imports)
 */
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-safe direct imports
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import JobDetail from "./pages/JobDetail";
import ClientPortal from "./pages/ClientPortal";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Firm Admin + Team Member routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["firm_admin", "team_member"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute allowedRoles={["firm_admin", "team_member"]}>
                <JobBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute allowedRoles={["firm_admin", "team_member"]}>
                <JobDetail />
              </ProtectedRoute>
            }
          />

          {/* Client only route */}
          <Route
            path="/client-portal"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientPortal />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
