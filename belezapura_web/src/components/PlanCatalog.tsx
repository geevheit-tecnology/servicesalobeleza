import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";

const FALLBACK_PLANS = [
  { id: "essencial", name: "Essencial", price: 59.90, maxProfessionals: 1 },
  { id: "studio", name: "Studio", price: 119.90, maxProfessionals: 5 },
  { id: "elite", name: "Elite", price: 319.09, maxProfessionals: 0 }
];

export function planFeatures(plan: { maxProfessionals: number }) { 
  return [
    plan.maxProfessionals > 0 ? `Até ${plan.maxProfessionals} profissional(is)` : "Profissionais ilimitados", 
    "Página exclusiva e agendamento online", 
    "Pix com conferência manual pelo salão", 
    "Gestão de clientes e atendimentos", 
    "Estoque por salão e painel financeiro"
  ]; 
}

export function PlanCatalog() {
  const [plans, setPlans] = useState<any[]>(FALLBACK_PLANS); 
  const navigate = useNavigate();

  useEffect(() => { 
    api<any[]>("/public/plans")
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch(() => {
        // Mantém FALLBACK_PLANS para não exibir erros ao público
      }); 
  }, []);

  return (
    <section id="planos" className="relative py-20 px-5 bg-[#FAFAFA] border-t">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="font-serif text-4xl text-[#111827]">Escolha o plano para o seu espaço</h2>
          <p className="text-[#6B7280]">14 dias de teste sem cartão. Assinatura mensal com pagamento e aprovação manual.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(p => (
            <article key={p.id} className="rounded-3xl border bg-white p-6 space-y-5 text-[#111827]">
              <h3 className="font-bold text-xl">{p.name}</h3>
              <p className="font-serif text-4xl">
                {Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                <span className="text-sm">/mês</span>
              </p>
              <ul className="space-y-3 text-sm">
                {planFeatures(p).map(f => <li key={f}>✓ {f}</li>)}
              </ul>
              <Button onClick={() => navigate(`/onboarding?planId=${p.id}`)}>
                Testar {p.name}
              </Button>
            </article>
          ))}
        </div>
        <p className="text-sm text-center text-[#6B7280]">
          Integração automática com WhatsApp, repasses bancários e multiunidades não estão incluídos nesta versão.
        </p>
      </div>
    </section>
  );
}
