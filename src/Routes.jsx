import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import ErrorBoundary from "./ErrorBoundary";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const MarketingDashboard = lazy(() => import("./MarketingDashboard"));

const LoadingFallback = () => (
  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
    Loading...
  </div>
);

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin-dashbaord" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketing-dashboard" 
            element={
              <ProtectedRoute requiredRole="MARKETING">
                <MarketingDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;