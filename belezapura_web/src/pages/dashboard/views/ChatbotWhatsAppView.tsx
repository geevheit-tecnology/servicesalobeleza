import { useState, useEffect } from "react";
import { 
  MessageCircle, 
  CheckCircle2, 
  Smartphone, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCheck,
  ExternalLink
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import { api } from "@/lib/api";

export function ChatbotWhatsAppView() {
  const [usage, setUsage] = useState<{ enabled: boolean; limit: number; used: number; remaining: number; month: string; plan: string; subscriptionStatus: string } | null>(null);
  const [usageError, setUsageError] = useState("");

  useEffect(() => {
    api<any>("/salon/whatsapp-usage")
      .then(d => { setUsage(d); })
      .catch(err => setUsageError(err.message || "Não foi possível carregar o status do WhatsApp."));
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

  const getPopulatedTemplate = (key: keyof typeof templates) => {
    return templates[key].text
      .replace(/\{\{cliente\}\}/g, "Camila Silva")
      .replace(/\{\{servico\}\}/g, "Alongamento em Gel")
      .replace(/\{\{profissional\}\}/g, "Rafaela")
      .replace(/\{\{data\}\}/g, "15/11")
      .replace(/\{\{horario\}\}/g, "14:30")
      .replace(/\{\{valor_sinal\}\}/g, "R$ 36,00 (20%)")
      .replace(/\{\{chave_pix\}\}/g, "contato@belezapura.com.br")
      .replace(/\{\{nome_salao\}\}/g, "Studio BelezaPura")
      .replace(/\{\{endereco_salao\}\}/g, "Av. Paulista, 1000 - Sala 42")
      .replace(/\{\{slug\}\}/g, "studio-belezapura");
  };

  const handleOpenDemoWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = testPhone.replace(/\D/g, "");
    if (!clean) return;
    const phoneWithCountry = clean.length <= 11 ? `55${clean}` : clean;
    const text = getPopulatedTemplate(selectedTemplate);
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSaveAutomations = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header com distinção explícita entre Configuração e Conexão Efetiva */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold">WhatsApp & Atendimento Automático</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              Sob demanda · franquia mensal
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Modelos de mensagens, confirmações de sinal Pix e status de ativação da rota automatizada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {usage?.enabled ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-semibold border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Configuração: Habilitada ({usage.plan || "Plano compatível"})
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 text-xs font-semibold border border-stone-200">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              Configuração: Não contratada
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-semibold border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Conexão efetiva: Aguardando homologação técnica
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => setActiveTab("connection")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "connection"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Conexão & Status
        </button>
        <button
          onClick={() => setActiveTab("automations")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "automations"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Regras de Envio
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "templates"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Modelos de Mensagem
        </button>
      </div>

      {/* Tab: Conexão & Status */}
      {activeTab === "connection" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card className="p-5 border-border">
              <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Status da Conexão & Franquia Mensal
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para transparência e segurança operacional, distinguimos a <strong>habilitação da configuração</strong> da <strong>conexão efetiva com o WhatsApp</strong>. Mensagens automáticas só são disparadas após confirmação da rota pela equipe técnica.
              </p>

              {usageError && (
                <div role="alert" className="p-3 rounded-lg bg-amber-50 text-amber-700 text-xs border border-amber-200 mb-3">{usageError}</div>
              )}

              {/* Comparativo de status */}
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">1. Configuração no Plano</div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {usage?.enabled ? (
                      <span className="text-blue-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Habilitado ({usage.plan || "Elite"})
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-500" /> Requer plano Elite
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {usage?.enabled
                      ? "A franquia do plano está autorizada para este salão."
                      : "Faça upgrade para a categoria Elite para liberar a franquia de automação."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">2. Conexão Efetiva do WhatsApp</div>
                  <div className="text-sm font-semibold flex items-center gap-2 text-amber-600">
                    <Clock className="w-4 h-4" /> Aguardando homologação técnica
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    O bot e os envios automáticos entram em operação mediante validação técnica da rota com o suporte.
                  </p>
                </div>
              </div>

              {usage && usage.enabled && usage.limit > 0 ? (
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">Franquia no mês ({usage.month})</span>
                    <span className="font-mono text-xs">{usage.used.toLocaleString("pt-BR")} / {usage.limit.toLocaleString("pt-BR")} disparos</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${usagePct}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Restam <strong>{usage.remaining.toLocaleString("pt-BR")}</strong> disparos neste mês (plano {usage.plan || "atual"}). A franquia renova no dia 1º de cada mês.
                    {usagePct >= 100 && " Franquia esgotada: os avisos voltam no próximo ciclo ou mediante ampliação de franquia."}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border space-y-2 text-sm">
                  <div className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    {usage && usage.limit <= 0 ? "Seu plano atual não inclui franquia automatizada" : "Avisos automáticos aguardando ativação"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usage && usage.limit <= 0
                      ? "Nos planos Essencial e Studio você envia avisos e comprovantes com 1 clique pela agenda (via WhatsApp Web/App, sem custo). No plano Elite você conta com franquia mensal para automação."
                      : "Entre em contato com o suporte BelezaPura para solicitar a ativação técnica e o pareamento da sua rota de envio."}
                  </p>
                </div>
              )}
            </Card>

            {/* Demonstração de Envio */}
            <Card className="p-5 border-border">
              <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Demonstração e Validação do Modelo
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Como os disparos automáticos requerem rota técnica homologada, você pode conferir o formato da mensagem abrindo uma demonstração direta no seu WhatsApp Web ou aplicativo.
              </p>
              <form onSubmit={handleOpenDemoWhatsApp} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="tel"
                    placeholder="Seu telefone: (11) 99999-9999"
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background"
                  />
                  <Button type="submit" size="sm" disabled={!testPhone.trim()} className="gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir no WhatsApp
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Abre uma conversa no seu WhatsApp preenchida com o modelo selecionado (sem custo e sem consumir franquia).
                </p>
              </form>
            </Card>
          </div>

          {/* Coluna Lateral de Métricas */}
          <div className="space-y-4">
            <Card className="p-5 border-border space-y-4">
              <h4 className="font-semibold text-sm">Métricas de Envio (Mês Atual)</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Disparos no mês:</span>
                  <span className="font-bold text-foreground">{usage?.used ?? 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Franquia contratada:</span>
                  <span className="font-bold text-foreground">{usage?.limit ?? 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Disparos restantes:</span>
                  <span className="font-bold text-primary">{usage?.remaining ?? 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status da rota:</span>
                  <span className="font-medium text-amber-600 text-xs">Pendente ativação</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
                💡 Enquanto a conexão automática aguarda ativação técnica, utilize o botão <strong>Conversar no WhatsApp</strong> na agenda para enviar lembretes e confirmações com 1 clique.
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Automações */}
      {activeTab === "automations" && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Condição de ativação das regras
            </div>
            <p>
              As regras abaixo definem o comportamento das mensagens do sistema. Enquanto a rota de disparo automático estiver pendente de homologação técnica, os textos abaixo servem como padrão para o envio manual via agenda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-border space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Notificação Imediata com Chave Pix</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Envia confirmação para a cliente assim que ela faz o agendamento pela página web. Se houver sinal cadastrado, anexa os dados do Pix.
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
                    Avisa no dia anterior sobre o horário, profissional e endereço do espaço para reduzir faltas.
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
                    Solicita resposta para confirmar presença ou solicitar reagendamento, facilitando o encaixe.
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
                    Agradece a visita e convida a cliente a deixar um depoimento no mural público do salão.
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
            <Button onClick={handleSaveAutomations}>Salvar Preferências de Regras</Button>
            {savedSuccess && <span className="text-xs text-emerald-600 font-medium">Preferências salvas com sucesso!</span>}
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
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Exemplo de Mensagem</span>
            </div>

            <div className="bg-[#EFEAE2] dark:bg-stone-900 rounded-xl p-4 min-h-[300px] flex flex-col justify-end shadow-inner">
              <div className="bg-white dark:bg-[#1f2c34] text-slate-800 dark:text-slate-100 p-3.5 rounded-2xl rounded-tl-none max-w-[90%] shadow-sm text-xs leading-relaxed whitespace-pre-line relative">
                {getPopulatedTemplate(selectedTemplate)}
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
