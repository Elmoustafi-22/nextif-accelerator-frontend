import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import FellowsDashboard from "../pages/FellowsDashboard";
import TasksPage from "../pages/TasksPage";
import TaskDetailsPage from "../pages/TaskDetailsPage";
import InboxPage from "../pages/InboxPage";
import ComplaintsPage from "../pages/ComplaintsPage";
import ReportsPage from "../pages/ReportsPage";
import ProfilePage from "../pages/ProfilePage";
import EventsPage from "../pages/EventsPage";
import RecordingsPage from "../pages/RecordingsPage";
import Layout from "../components/Layout";

// Placeholder components
const Unauthorized = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFD] p-8 text-center">
      <div className="bg-red-50 text-red-600 p-4 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
      <h2 className="text-3xl font-black font-heading text-neutral-900 tracking-tight">Unauthorized Access</h2>
      <p className="mt-4 text-neutral-500 font-medium">You don't have permission to view this page.</p>
      <p className="mt-2 text-sm text-neutral-400 font-bold uppercase tracking-widest">Redirecting to your dashboard in 5 seconds...</p>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes - Ambassador Only */}
      <Route element={<ProtectedRoute allowedRoles={["ambassador"]} />}>
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<Layout children={<Outlet />} />}>
          <Route path="/dashboard" element={<FellowsDashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/recordings" element={<RecordingsPage />} />
          {/* Future Ambassador routes: /tasks */}
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
