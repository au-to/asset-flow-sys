import { Routes, Route, Navigate } from 'react-router-dom';
import { Role } from '@asset-flow/shared';
import AuthGuard from '../components/AuthGuard';
import AppLayout from '../components/AppLayout';
import LoginPage from '../pages/Login';
import ForbiddenPage from '../pages/Forbidden';
import ApplicationPage from '../pages/Application';
import ApprovalPage from '../pages/Approval';
import AuditPage from '../pages/Audit';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route path="/application" element={<ApplicationPage />} />
        <Route path="/approval" element={<ApprovalPage />} />
        <Route
          path="/audit"
          element={
            <AuthGuard roles={[Role.ADMIN, Role.AUDITOR]}>
              <AuditPage />
            </AuthGuard>
          }
        />
        <Route path="/" element={<Navigate to="/application" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/application" replace />} />
    </Routes>
  );
}
