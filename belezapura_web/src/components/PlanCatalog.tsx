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
      "Automação WhatsApp & Bot IA 24h",
      "Assessoria VIP: Google Meu Negócio & Botão no Google Maps",
      "Controle de estoque com alerta de reposição",
      "Relatórios detalhados de faturamento",
      "Suporte prioritário VIP"
    ]
  }
];

export function planFeatures(plan: { name?: string; price?: number; maxProfessionals: number; features?: string[] }) {
  if (Array.isArray(plan.features) && plan.features.length > 0) {
    return plan.features;
  }
  const nameLower = (plan.name || "").toLowerCase();
  if (nameLower.includes("elite") || plan.maxProfessionals === 0 || (plan.price && plan.price >= 200)) {
    return [
      "Tudo do plano Studio incluso",
      plan.maxProfessionals > 0 ? `Até ${plan.maxProfessionals} profissionais ativos` : "Profissionais ilimitados",
      "Automação WhatsApp & Bot IA 24h (franquia de até 1.000 disparos/mês)",
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
      "Relatórios gerenciais de desempenho",
      "Controle de estoque de produtos do salão"
    ];
  }
  return [
    plan.maxProfessionals > 1 ? `Até ${plan.maxProfessionals} profissionais` : "Até 1 profissional (autônoma)",
    "Página exclusiva na Bio e agendamento online 24h",
    "Gestão de agenda, clientes e catálogo de serviços",
    "Sinal antecipado via Pix com conferência no painel",
    "Mural de avaliações de clientes na página pública"
  ];
}

export function PlanCatalog() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { 
    api<any[]>("/public/plans")
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) throw new Error("Nenhum plano disponível.");
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
            features: planFeatures(plan),
          };
        }));
      })
      .catch(() => {
        setError("Não foi possível carregar os planos. Tente novamente em instantes ou fale conosco.");
      }).finally(() => setLoading(false));
  }, []);

  return (
    <section id="planos" className="relative py-20 px-5 bg-[#FAFAFA] border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5A991]/15 border border-[#E5A991]/40 text-[#9C5A42] text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C47F65]" /> Planos Transparentes
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#111827]">
            Escolha o plano ideal para o seu espaço
          </h2>
          <p className="text-[#6B7280] text-base max-w-xl mx-auto">
            14 dias de teste sem cartão. Comece a receber agendamentos com sinal hoje mesmo.
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
                  ? "bg-[#111827] text-white border-2 border-[#E5A991] shadow-2xl md:scale-[1.03]" 
                  : "bg-white text-[#111827] border border-[#E5E7EB] shadow-xs hover:shadow-md"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#E5A991] text-[#111827] font-extrabold text-[10px] px-3 py-1 shadow-md">
                    {p.badge}
                  </Badge>
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h3 className={`font-bold text-2xl ${p.highlight ? "text-white" : "text-[#111827]"}`}>{p.name}</h3>
                  <p className={`text-xs mt-1 ${p.highlight ? "text-stone-300" : "text-[#6B7280]"}`}>{p.desc}</p>
                </div>

                <div className="mb-6 pb-6 border-b border-border/40">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight">
                      {Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    <span className={`text-sm ${p.highlight ? "text-stone-300" : "text-[#6B7280]"}`}>/mês</span>
                  </div>
                  <span className={`text-[11px] block mt-1 font-medium ${p.highlight ? "text-[#E5A991]" : "text-emerald-700"}`}>
                    🎁 14 dias de teste grátis
                  </span>
                </div>

                <ul className="space-y-3.5 text-sm mb-8">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-[#E5A991]" : "text-emerald-700"} stroke-[3]`} />
                      <span className={p.highlight ? "text-stone-200" : "text-[#4B5563]"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={() => navigate(`/onboarding?planId=${p.id}`)}
                className={`w-full h-12 font-bold rounded-xl transition-all cursor-pointer ${
                  p.highlight
                    ? "bg-[#E5A991] hover:bg-[#D89981] text-[#111827] shadow-lg hover-lift"
                    : "bg-[#111827] hover:bg-[#1F2937] text-white"
                }`}
              >
                Testar {p.name}
              </Button>
            </article>
          ))}
        </div>

        <p className="text-xs text-center text-[#6B7280]">
          Integração automática com WhatsApp, repasses bancários e multiunidades não estão incluídos nesta versão.
        </p>
      </div>
    </section>
  );
}
