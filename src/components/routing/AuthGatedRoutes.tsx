import { useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const ApiKeys = lazy(() => import("@/pages/dashboard/ApiKeys"));
const Usage = lazy(() => import("@/pages/dashboard/Usage"));
const Billing = lazy(() => import("@/pages/dashboard/Billing"));
const Projects = lazy(() => import("@/pages/dashboard/Projects"));
const ProjectDetail = lazy(() => import("@/pages/dashboard/ProjectDetail"));

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-sm text-muted-foreground font-mono">Loading…</div>
  </div>
);

/**
 * Wraps auth + dashboard routes in AuthProvider so that
 * public marketing/docs pages never initialize Supabase auth listeners.
 */
export default function AuthGatedRoutes() {
  const location = useLocation();

  // Render the correct component based on current path
  const renderPage = () => {
    if (location.pathname === "/auth") return <Auth />;
    if (location.pathname === "/auth/reset-password") return <ResetPassword />;
    if (location.pathname === "/dashboard") return <Dashboard />;
    if (location.pathname === "/dashboard/api-keys") return <ApiKeys />;
    if (location.pathname === "/dashboard/usage") return <Usage />;
    if (location.pathname === "/dashboard/billing") return <Billing />;
    if (location.pathname === "/dashboard/projects") return <Projects />;
    if (location.pathname.startsWith("/dashboard/projects/")) return <ProjectDetail />;
    return <Dashboard />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<Fallback />}>
          {renderPage()}
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}
