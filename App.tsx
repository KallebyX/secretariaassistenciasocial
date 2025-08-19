import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import ServerDashboardPage from './pages/ServerDashboardPage';
import BeneficiaryPortalPage from './pages/BeneficiaryPortalPage';
import SecretaryDashboardPage from './pages/SecretaryDashboardPage';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import BeneficiaryListPage from './pages/admin/BeneficiaryListPage';
import BeneficiaryProfilePage from './pages/admin/BeneficiaryProfilePage';
import ProgramManagementPage from './pages/admin/ProgramManagementPage';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<Navigate to="/" />} />
        </>
      ) : (
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                {user.cargo === 'servidor' && (
                  <>
                    <Route path="/dashboard" element={<ServerDashboardPage />} />
                    <Route path="/admin/beneficiaries" element={<BeneficiaryListPage />} />
                    <Route path="/admin/beneficiaries/:id" element={<BeneficiaryProfilePage />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </>
                )}
                {user.cargo === 'beneficiario' && (
                  <>
                    <Route path="/portal" element={<BeneficiaryPortalPage />} />
                    <Route path="/" element={<Navigate to="/portal" />} />
                  </>
                )}
                {user.cargo === 'secretario' && (
                  <>
                    <Route path="/secretary" element={<SecretaryDashboardPage />} />
                    <Route path="/admin/beneficiaries" element={<BeneficiaryListPage />} />
                    <Route path="/admin/beneficiaries/:id" element={<BeneficiaryProfilePage />} />
                    <Route path="/admin/programs" element={<ProgramManagementPage />} />
                    <Route path="/" element={<Navigate to="/secretary" />} />
                  </>
                )}
                <Route path="/home" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          }
        />
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
