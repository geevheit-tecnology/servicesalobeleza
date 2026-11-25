import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Badge } from "@/components/ui";
import { api } from "@/lib/api";
import { Check, Sparkles } from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  price: number;
  desc: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
}

const FALLBACK_PLANS: PlanItem[] = [
  {
    id: "essencial",
    name: "Essencial",
    price: 59.90,
    desc: "Para profissionais autônomas que atendem sozinhas",
    features: [
      "1 profissional (você)",
      "Link exclusivo na bio do Instagram",
      "Agendamento online 24h",
      "Sinal no Pix direto na sua conta",
      "Cadastro de clientes e procedimentos"
    ]
  },
  {
    id: "studio",
    name: "Studio",
    price: 119.90,
    desc: "Para studios, clínicas e salões em equipe",
    highlight: true,
    badge: "MAIS ESCOLHIDO",
    features: [
      "Tudo do Essencial",
      "Até 5 profissionais na equipe",
      "Resumo e estimativa de comissões",
      "Agenda por profissional e horários bloqueados",
      "Painel financeiro com histórico",
      "🎁 14 dias de teste grátis"
    ]
  },
  {
    id: "elite",
    name: "Elite",
    price: 319.09,
    desc: "Para grandes espaços, redes e clínicas",
    features: [
      "Tudo do Studio",
      "Profissionais ilimitados",
      "Automação WhatsApp & Bot IA 24h (mediante ativação técnica; até 1.000 disparos/mês)",
      "Assessoria VIP: Google Meu Negócio & Botão no Google Maps",
      "Controle de estoque com alerta de reposição",
      "Relatórios detalhados de faturamento",
      "Suporte prioritário VIP"
    ]
  }
];

export function extractTrialDays(plans: any[]): number {
  if (Array.isArray(plans)) {
    for (const p of plans) {
      if (typeof p?.trialDays === "number" && p.trialDays > 0) {
        return p.trialDays;
      }
    }
    for (const p of plans) {
      if (Array.isArray(p?.features)) {
        for (const f of p.features) {
          const m = String(f || "").match(/(\d+)\s*dias\s+de\s+teste/i);
          if (m) {
            const parsed = parseInt(m[1], 10);
            if (parsed > 0) return parsed;
          }
        }
      }
    }
  }
  return 14;
}

export function planFeatures(plan: { name?: string; price?: number; maxProfessionals: number; features?: string[] }, trialDays = 14) {
  if (Array.isArray(plan.features) && plan.features.length > 0) {
    return plan.features.map(f =>
      String(f).replace(/(\d+)\s*dias de teste gr[áa]tis/i, `${trialDays} dias de teste grátis`)
    );
  }
  const nameLower = (plan.name || "").toLowerCase();
  if (nameLower.includes("elite") || plan.maxProfessionals === 0 || (plan.price && plan.price >= 200)) {
    return [
      "Tudo do plano Studio incluso",
      plan.maxProfessionals > 0 ? `Até ${plan.maxProfessionals} profissionais ativos` : "Profissionais ilimitados",
      "Automação WhatsApp & Bot IA 24h (mediante ativação técnica; franquia de até 1.000 disparos/mês)",
      "Assessoria VIP: Google Meu Negócio otimizado com botão no Google Maps",
      "Controle de estoque completo com alerta de reposição",
      "Relatórios avançados de faturamento, retenção e ticket médio",
      "Múltiplos acessos por perfil (Recepção e Profissionais)",
      "Suporte prioritário VIP"
    ];
  }
  if (nameLower.includes("studio") || plan.maxProfessionals > 1 || (plan.price && plan.price >= 100)) {
    return [
      "Tudo do plano Essencial incluso",
      `Até ${plan.maxProfessionals || 5} profissionais na equipe`,
      "Gestão de comissões e rateio automático por profissional",
      "Painel financeiro completo (fluxo de caixa e receitas)",
      "Agenda multi-profissional com bloqueio de horários",
      "Aviso de WhatsApp com 1 clique pela agenda (manual sem custo extra)",
      "Relatórios gerenciais de desempenho",
      "Controle de estoque de produtos do salão"
    ];
  }
  return [
    plan.maxProfessionals > 1 ? `Até ${plan.maxProfessionals} profissional(is)` : "Até 1 profissional (autônoma)",
    "Página exclusiva na Bio e agendamento online 24h",
    "Gestão de agenda, clientes e catálogo de serviços",
    "Sinal antecipado via Pix com conferência no painel",
    "Mural de avaliações de clientes na página pública"
  ];
}

export function PlanCatalog({ onTrialDaysLoaded }: { onTrialDaysLoaded?: (days: number) => void }) {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [trialDays, setTrialDays] = useState<number>(14);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { 
    api<any[]>("/public/plans")
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) throw new Error("Nenhum plano disponível.");
        const td = extractTrialDays(data);
        setTrialDays(td);
        onTrialDaysLoaded?.(td);
        setPlans(data.map(plan => {
          const presentation = FALLBACK_PLANS.find(p => p.name.toLowerCase() === plan.name?.toLowerCase());
          const isHighlight = Boolean(plan.highlight) || plan.name?.toLowerCase() === "studio";
          return {
            id: plan.id,
            name: plan.name,
            price: Number(plan.price),
            desc: presentation?.desc || plan.category || "Assinatura mensal com conferência manual",
            highlight: isHighlight,
            badge: isHighlight ? "MAIS ESCOLHIDO" : (plan.category || undefined),
            features: planFeatures(plan, td),
          };
        }));
      })
      .catch(() => {
        setError("Não foi possível carregar os planos. Tente novamente em instantes ou fale conosco.");
      }).finally(() => setLoading(false));
  }, []);

  return (
    <section id="planos" className="relative py-20 px-5 bg-gradient-to-b from-[#FDFBF9] to-[#FAF3F4]/60 border-t border-[#EFE4E6]">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-[#9F4356] text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C86D7D]" /> Planos Transparentes
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1A1C]">
            Escolha o plano ideal para o seu espaço
          </h2>
          <p className="text-[#6E6266] text-base max-w-xl mx-auto">
            {trialDays} dias de teste sem cartão. Comece a receber agendamentos com sinal hoje mesmo.
          </p>
        </div>

        {loading && <p role="status" className="text-center text-sm">Carregando planos disponíveis...</p>}
        {error && <p role="alert" className="text-center text-sm">{error}</p>}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map(p => (
            <article 
              key={p.id} 
              className={`rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                p.highlight 
                  ? "bg-gradient-to-b from-white via-[#FFF9FA] to-[#FDF2F4] text-[#1F1A1C] border-2 border-[#D98A98] shadow-xl shadow-rose-200/40 md:scale-[1.03]" 
                  : "bg-white/95 text-[#1F1A1C] border border-[#EFE4E6] shadow-xs hover:shadow-md hover:border-rose-200"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-[#C86D7D] to-[#D98A98] text-white border-0 font-bold text-[10px] px-3.5 py-1 shadow-sm">
                    {p.badge}
                  </Badge>
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h3 className="font-serif font-bold text-2xl text-[#1F1A1C]">{p.name}</h3>
                  <p className="text-xs mt-1 text-[#6E6266]">{p.desc}</p>
                </div>

                <div className="mb-6 pb-6 border-b border-[#EFE4E6]">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1F1A1C]">
                      {Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    <span className="text-sm text-[#6E6266]">/mês</span>
                  </div>
                  <span className="text-[11px] block mt-1.5 font-semibold text-[#9F4356]">
                    🎁 {trialDays} dias de teste grátis
                  </span>
                </div>

                <ul className="space-y-3.5 text-sm mb-8">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#C86D7D] stroke-[2.5]" />
                      <span className="text-[#4E4347]">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={() => navigate(`/onboarding?planId=${p.id}`)}
                className={`w-full h-12 font-bold rounded-xl transition-all cursor-pointer ${
                  p.highlight
                    ? "bg-gradient-to-r from-[#C86D7D] to-[#B55969] hover:opacity-95 text-white shadow-md shadow-rose-300/40 hover-lift border-0"
                    : "bg-[#FAF3F4] hover:bg-[#F3E5E8] text-[#9F4356] border border-rose-200/70"
                }`}
              >
                Testar {p.name}
              </Button>
            </article>
          ))}
        </div>

        <p className="text-xs text-center text-[#6E6266]">
          Automação de WhatsApp e Bot IA dependem de plano compatível, ativação técnica prévia com o suporte e estão sujeitos à franquia contratada. Repasses bancários automatizados e multiunidades não estão incluídos nesta versão.
        </p>
      </div>
    </section>
  );
}
