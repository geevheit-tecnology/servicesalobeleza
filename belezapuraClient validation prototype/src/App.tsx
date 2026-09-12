import { useState } from "react";
import { Sparkles, Globe, LayoutDashboard, ShieldCheck, ChevronRight, Rocket } from "lucide-react";
import Marketing from "@/pages/Marketing";
import ClientView from "@/pages/ClientView";
import SalonDashboard from "@/pages/SalonDashboard";
import SuperAdmin from "@/pages/SuperAdmin";
import Onboarding from "@/pages/Onboarding";

type View = "marketing" | "client" | "salon" | "superadmin" | "onboarding";

const TABS: { id: View; label: string; sub: string; icon: any }[] = [
  { id: "marketing", label: "Landing Page", sub: "SaaS", icon: Sparkles },
  { id: "client", label: "Cliente Final", sub: "Mobile", icon: Globe },
  { id: "salon", label: "Painel do Salão", sub: "Dashboard", icon: LayoutDashboard },
  { id: "superadmin", label: "Super Admin", sub: "Plataforma", icon: ShieldCheck },
  { id: "onboarding", label: "Onboarding", sub: "Novo salão", icon: Rocket },
];

export default function App() {
  const [view, setView] = useState<View>("marketing");

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Prototype nav strip */}
      <div className="shrink-0 bg-foreground/96 backdrop-blur text-white/90 px-4 py-2 flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0 mr-2">
          <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="font-serif text-sm text-white/60">beautyOS</span>
          <ChevronRight className="w-3 h-3 text-white/30 mx-1" />
          <span className="text-[10px] text-white/30 font-semibold tracking-widest uppercase">Protótipo</span>
        </div>
        <div className="flex items-center gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                view === t.id ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/8 hover:text-white/70"
              }`}
            >
              <t.icon className={`w-3 h-3 ${view === t.id ? "text-white" : "opacity-60"}`} />
              {t.label}
              <span className={`text-[10px] hidden sm:inline ${view === t.id ? "text-white/50" : "text-white/25"}`}>{t.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === "marketing" && (
          <div className="h-full overflow-y-auto">
            <Marketing onNavigate={v => setView(v as View)} />
          </div>
        )}
        {view === "client" && (
          <div className="h-full overflow-y-auto bg-muted/30">
            <ClientView />
          </div>
        )}
        {view === "salon" && (
          <div className="h-full overflow-hidden">
            <SalonDashboard />
          </div>
        )}
        {view === "superadmin" && (
          <div className="h-full overflow-hidden">
            <SuperAdmin />
          </div>
        )}
        {view === "onboarding" && (
          <div className="h-full overflow-y-auto">
            <Onboarding onFinish={() => setView("salon")} />
          </div>
        )}
      </div>
    </div>
  );
}
