import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Marketing from "@/pages/Marketing";
import ClientView from "@/pages/ClientView";
import SalonDashboard from "@/pages/SalonDashboard";
import SuperAdmin from "@/pages/SuperAdmin";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Marketing />} />
        <Route path="/login" element={<Login />} />
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
