import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import Layout from "../components/Layout";

// Placeholder components
const Unauthorized = () => (
  <div className="p-8 text-center text-red-500">
    <h2 className="text-2xl font-bold">Unauthorized Access</h2>
    <p className="mt-2">You don't have permission to view this page.</p>
  </div>
);

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
          {/* Future Ambassador routes: /tasks */}
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
