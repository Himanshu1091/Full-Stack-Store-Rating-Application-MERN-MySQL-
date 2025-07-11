// src/routes.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import UserDashboard from './pages/UserDashboard';
import NavigateToRoleDashboard from './components/NavigateToRoleDashboard';
import StoreListPage from './pages/StoreListPage'; // ✅ added

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<NavigateToRoleDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/owner" element={<StoreOwnerDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/stores" element={<StoreListPage />} /> {/* ✅ for viewing & rating stores */}
      </Routes>
    </Router>
  );
}

export default AppRoutes;
