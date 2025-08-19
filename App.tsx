import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import ServerDashboardPage from './pages/ServerDashboardPage';
import BeneficiaryPortalPage from './pages/BeneficiaryPortalPage';
import SecretaryDashboardPage from './pages/SecretaryDashboardPage';
import Layout from './components/Layout';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route
        path="/*"
        element={
          user ? (
            <Layout>
              <Routes>
                {user.cargo === 'servidor' && (
                  <>
                    <Route path="/dashboard" element={<ServerDashboardPage />} />
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
                      <Route path="/" element={<Navigate to="/secretary" />} />
                    </>
                )}
                 <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
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
