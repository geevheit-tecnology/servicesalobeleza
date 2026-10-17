import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Lazy load all pages for instant initial load and fast navigation
const Marketing = lazy(() => import("@/pages/Marketing"));
const ClientView = lazy(() => import("@/pages/ClientView"));
const SalonDashboard = lazy(() => import("@/pages/SalonDashboard"));
const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Login = lazy(() => import("@/pages/Login"));
const SuperAdminLogin = lazy(() => import("@/pages/SuperAdminLogin"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Contact = lazy(() => import("@/pages/Contact"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Carregando BelezaPura...</span>
      </div>
    </div>
  );
}

export default function App() {
  // Silent API warm-up to prevent cold-start delay on cloud servers (e.g. Render)
  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || "http://localhost:3050";
    try {
      fetch(`${api}/api/public/plans`, { method: "GET" }).catch(() => {});
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Marketing />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/termos-de-uso" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/politica-de-privacidade" element={<Privacy />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-admin" element={<SuperAdminLogin />} />
          <Route path="/admin" element={<SalonDashboard />} />
          <Route path="/superadmin" element={<SuperAdmin />} />
          <Route path="/onboarding" element={<Onboarding onFinish={() => {}} />} />
          <Route path="/agendar/:slug" element={<ClientView />} />
          <Route path="/app" element={<ClientView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
