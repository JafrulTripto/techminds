import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Theme
import theme from './theme/theme';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import WorkOrdersPage from './pages/WorkOrdersPage';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth routes - accessible only when not authenticated */}
            <Route element={<ProtectedRoute requireAuth={false} />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            {/* Protected routes - require authentication */}
            <Route element={<MainLayout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/work-orders" element={<WorkOrdersPage />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin/users" element={<div>User Management (Admin Only)</div>} />
              </Route>
              
              {/* Error routes */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
