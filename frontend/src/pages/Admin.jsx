import { Navigate, Route, Routes } from "react-router-dom";
import StaffRoute from "../components/staff/StaffRoute";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminStaff from "../components/admin/AdminStaff";
import AdminSalesReps from "../components/admin/AdminSalesReps";

/**
 * Main page of the admin panel. App.jsx mounts it at /admin-panel/*, so the
 * paths below are relative to /admin-panel. Only the administrator gets in;
 * signed-out visitors go to the login page and staff go to their own panel.
 */
const Admin = () => {
  return (
    <Routes>
      <Route element={<StaffRoute requireSuperuser />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="sales-reps" element={<AdminSalesReps />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin-panel" replace />} />
    </Routes>
  );
};

export default Admin;