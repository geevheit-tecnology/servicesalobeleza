import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Marketing from "@/pages/Marketing";
import ClientView from "@/pages/ClientView";
import SalonDashboard from "@/pages/SalonDashboard";
import SuperAdmin from "@/pages/SuperAdmin";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import SuperAdminLogin from "@/pages/SuperAdminLogin";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Contact from "@/pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
