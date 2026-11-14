import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

import { LandingPage } from '../pages/LandingPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { BookFlowPage } from '../pages/BookFlowPage.jsx';
import { MyAppointmentsPage } from '../pages/MyAppointmentsPage.jsx';
import { AppointmentDetailPage } from '../pages/AppointmentDetailPage.jsx';
import { ProfilePage } from '../pages/ProfilePage.jsx';
import { ProviderDashboardPage } from '../pages/ProviderDashboardPage.jsx';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth layout routes (Login, Register) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Main layout routes */}
      <Route element={<MainLayout />}>
        {/* Public home page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated user routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/book" element={<BookFlowPage />} />
          <Route path="/appointments" element={<MyAppointmentsPage />} />
          <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Provider-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
          <Route path="/provider" element={<ProviderDashboardPage />} />
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
