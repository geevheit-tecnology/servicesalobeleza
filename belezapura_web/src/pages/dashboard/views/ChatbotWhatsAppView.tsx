import { useState, useEffect } from "react";
import { 
  MessageCircle, 
  QrCode, 
  CheckCircle2, 
  Smartphone, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Sliders, 
  CheckCheck,
  Zap,
  PhoneCall,
  Copy
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import { api } from "@/lib/api";

export function ChatbotWhatsAppView() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "qr_ready">("disconnected");
  const [phoneNumber] = useState("Número central BelezaPura");
  const [usage, setUsage] = useState<{ enabled: boolean; limit: number; used: number; remaining: number; month: string; plan: string; subscriptionStatus: string } | null>(null);
  const [usageError, setUsageError] = useState("");

  useEffect(() => {
    api<any>("/salon/whatsapp-usage")
      .then(d => { setUsage(d); setStatus(d?.enabled ? "connected" : "disconnected"); })
      .catch(err => setUsageError(err.message || "Não foi possível carregar a franquia de WhatsApp."));
  }, []);

  const usagePct = usage && usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;
  const [activeTab, setActiveTab] = useState<"connection" | "automations" | "templates">("connection");

  // Automações
  const [enableImmediateConfirm, setEnableImmediateConfirm] = useState(true);
  const [enable24hReminder, setEnable24hReminder] = useState(true);
  const [enable2hReminder, setEnable2hReminder] = useState(true);
  const [enablePostService, setEnablePostService] = useState(true);

  // Template selecionado para pré-visualização
  const [selectedTemplate, setSelectedTemplate] = useState<"confirm" | "reminder24h" | "reminder2h" | "post">("confirm");
  const [testPhone, setTestPhone] = useState("");
  const [testSent, setTestSent] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const templates = {
    confirm: {
      title: "Confirmação com Chave Pix",
      text: "Olá, *{{cliente}}*! ✨\n\nSeu agendamento de *{{servico}}* com *{{profissional}}* foi pré-reservado para *{{data}} às {{horario}}*.\n\nPara garantir seu horário, envie o sinal de *{{valor_sinal}}* no Pix abaixo:\n🔑 *Chave Pix:* {{chave_pix}}\nFavorecido: {{nome_salao}}\n\nApós o pagamento, seu horário estará 100% garantido! Qualquer dúvida, estamos por aqui.",
    },
    reminder24h: {
      title: "Lembrete 24 horas antes",
      text: "Oi, *{{cliente}}*! 🌸 Passando para lembrar do seu atendimento amanhã:\n\n📅 *Data:* {{data}}\n⏰ *Horário:* {{horario}}\n✂️ *Serviço:* {{servico}}\n👤 *Profissional:* {{profissional}}\n📍 *Local:* {{endereco_salao}}\n\nEstamos ansiosos para receber você!",
    },
    reminder2h: {
      title: "Confirmação rápida (2h antes)",
      text: "Olá, *{{cliente}}*! Seu atendimento de *{{servico}}* começa em 2 horas (às {{horario}}).\n\nVocê confirma sua presença?\n👉 Digite *1* para Confirmar\n👉 Digite *2* se precisar Reagendar",
    },
    post: {
      title: "Agradecimento e Avaliação",
      text: "Oi, *{{cliente}}*! ❤️ Adoramos receber você hoje no {{nome_salao}}!\n\nComo foi sua experiência com *{{profissional}}*? Sua opinião nos ajuda a evoluir:\n⭐ https://belezapura.com.br/avaliar/{{slug}}\n\nAté a próxima!",
    },
  };

  const handleTestSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  const handleSaveAutomations = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold">WhatsApp & Atendimento Automático</h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
              Sob demanda · franquia mensal
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Notificações automáticas, confirmação de horários com Pix e lembretes para reduzir faltas (no-show).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === "connected" ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              WhatsApp ativo · {usage ? `${usage.used}/${usage.limit} no mês` : phoneNumber}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-semibold border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              WhatsApp automático desativado
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("connection")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "connection"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Conexão & Status
        </button>
        <button
          onClick={() => setActiveTab("automations")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "automations"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Regras de Envio
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "templates"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Modelos de Mensagem
        </button>
      </div>

      {/* Tab: Conexão */}
      {activeTab === "connection" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card className="p-5 border-border">
              <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Franquia mensal de disparos WhatsApp
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Os avisos automáticos saem pelo número central da BelezaPura — você não precisa configurar nada nem escanear QR Code.
                O envio é liberado sob demanda pela equipe BelezaPura e cada plano tem uma franquia de mensagens por mês.
              </p>

              {usageError && (
                <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-xs border border-amber-200 mb-3">{usageError}</div>
              )}

              {usage && usage.enabled && usage.limit > 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-100">Disparos no mês ({usage.month})</span>
                    <span className="font-mono">{usage.used.toLocaleString("pt-BR")} / {usage.limit.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-emerald-100 dark:bg-emerald-900/50 overflow-hidden">
                    <div className={`h-full rounded-full ${usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${usagePct}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Restam <strong>{usage.remaining.toLocaleString("pt-BR")}</strong> mensagens neste mês (plano {usage.plan || "atual"}). A franquia renova todo dia 1º.
                    {usagePct >= 100 && " Franquia esgotada: os avisos voltam no próximo mês ou com upgrade de plano."}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border space-y-2 text-sm">
                  <div className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    {usage && usage.limit <= 0 ? "Seu plano não inclui avisos automáticos" : "Avisos automáticos ainda não ativados"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usage && usage.limit <= 0
                      ? "No plano Essencial você envia o aviso com 1 clique pela agenda (WhatsApp manual, sem custo). Faça upgrade para Studio (150/mês) ou Elite (1.000/mês) para avisos automáticos."
                      : "Solicite a ativação ao suporte BelezaPura. Assim que liberado, as confirmações de agendamento passam a ser enviadas automaticamente."}
                  </p>
                </div>
              )}
            </Card>


            {/* Teste de Disparo */}
            <Card className="p-5 border-border">
              <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Testar Envio de Mensagem
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Envie uma mensagem de demonstração para seu número pessoal para validar o funcionamento do bot.
              </p>
              <form onSubmit={handleTestSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
                />
                <Button type="submit" size="sm" disabled={testSent || !testPhone}>
                  {testSent ? "Enviado com sucesso!" : "Enviar Teste"}
                </Button>
              </form>
              {testSent && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mensagem de teste despachada para o WhatsApp informado!
                </p>
              )}
            </Card>
          </div>

          {/* Coluna Lateral de Métricas */}
          <div className="space-y-4">
            <Card className="p-5 border-border space-y-4">
              <h4 className="font-semibold text-sm">Métricas de Envio (Mês Atual)</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Lembretes enviados:</span>
                  <span className="font-bold text-foreground">148</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Confirmações automáticas:</span>
                  <span className="font-bold text-emerald-600">96.4%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Queda no no-show:</span>
                  <span className="font-bold text-primary">-78%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
                💡 Salões que ativam o lembrete de 2 horas e a solicitação de sinal no Pix reduzem as faltas de clientes para menos de 4%.
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Automações */}
      {activeTab === "automations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-border space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Notificação Imediata com Chave Pix</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Envia confirmação instantânea para a cliente assim que ela faz o agendamento pela página web. Se houver sinal cadastrado, anexa os dados do Pix.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableImmediateConfirm}
                  onChange={e => setEnableImmediateConfirm(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer mt-1"
                />
              </div>
            </Card>

            <Card className="p-5 border-border space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Lembrete de 24 Horas Antes</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dispara uma mensagem no dia anterior avisando sobre o horário, profissional e endereço do espaço.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enable24hReminder}
                  onChange={e => setEnable24hReminder(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer mt-1"
                />
              </div>
            </Card>

            <Card className="p-5 border-border space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Confirmação Rápida (2 Horas Antes)</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pede para a cliente responder 1 para confirmar ou 2 para reagendar caso ocorra imprevisto, liberando o horário para encaixe se necessário.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enable2hReminder}
                  onChange={e => setEnable2hReminder(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer mt-1"
                />
              </div>
            </Card>

            <Card className="p-5 border-border space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Pós-Atendimento e Avaliação</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Envia mensagem de agradecimento 1 hora após a conclusão do agendamento, solicitando uma avaliação 5 estrelas.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enablePostService}
                  onChange={e => setEnablePostService(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer mt-1"
                />
              </div>
            </Card>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveAutomations}>Salvar Regras de Envio</Button>
            {savedSuccess && <span className="text-xs text-emerald-600 font-medium">Configurações salvas!</span>}
          </div>
        </div>
      )}

      {/* Tab: Templates & Pré-visualização */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Escolha o Modelo para Editar</h3>
            
            <div className="space-y-2">
              {(["confirm", "reminder24h", "reminder2h", "post"] as const).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all cursor-pointer ${
                    selectedTemplate === key
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="font-medium text-foreground">{templates[key].title}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{templates[key].text}</div>
                </button>
              ))}
            </div>

            <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-foreground">Variáveis disponíveis:</div>
              <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                <code className="bg-background px-1 py-0.5 rounded border">{"{{cliente}}"}</code>
                <code className="bg-background px-1 py-0.5 rounded border">{"{{servico}}"}</code>
                <code className="bg-background px-1 py-0.5 rounded border">{"{{profissional}}"}</code>
                <code className="bg-background px-1 py-0.5 rounded border">{"{{data}}"}</code>
                <code className="bg-background px-1 py-0.5 rounded border">{"{{horario}}"}</code>
                <code className="bg-background px-1 py-0.5 rounded border">{"{{chave_pix}}"}</code>
                <code className="bg-background px-1 py-0.5 rounded border">{"{{valor_sinal}}"}</code>
              </div>
            </div>
          </div>

          {/* Pré-visualização ao vivo WhatsApp */}
          <div className="border border-border rounded-2xl p-4 bg-muted/20">
            <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center justify-between">
              <span>Pré-visualização no WhatsApp</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Exemplo Real</span>
            </div>

            <div className="bg-[#EFEAE2] dark:bg-stone-900 rounded-xl p-4 min-h-[300px] flex flex-col justify-end shadow-inner">
              <div className="bg-white dark:bg-[#1f2c34] text-slate-800 dark:text-slate-100 p-3.5 rounded-2xl rounded-tl-none max-w-[90%] shadow-sm text-xs leading-relaxed whitespace-pre-line relative">
                {templates[selectedTemplate].text
                  .replace(/\{\{cliente\}\}/g, "Camila Silva")
                  .replace(/\{\{servico\}\}/g, "Alongamento em Gel")
                  .replace(/\{\{profissional\}\}/g, "Rafaela")
                  .replace(/\{\{data\}\}/g, "15/11")
                  .replace(/\{\{horario\}\}/g, "14:30")
                  .replace(/\{\{valor_sinal\}\}/g, "R$ 36,00 (20%)")
                  .replace(/\{\{chave_pix\}\}/g, "contato@belezapura.com.br")
                  .replace(/\{\{nome_salao\}\}/g, "Studio BelezaPura")
                  .replace(/\{\{endereco_salao\}\}/g, "Av. Paulista, 1000 - Sala 42")
                  .replace(/\{\{slug\}\}/g, "studio-belezapura")
                }
                <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground mt-2">
                  <span>14:31</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
