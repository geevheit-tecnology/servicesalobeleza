import { useState, useEffect, useRef } from "react";
import { 
  Bot, MessageSquare, Send, Sparkles, Check, CheckCheck, Phone, ShieldCheck, 
  Clock, Zap, Crown, AlertCircle, RefreshCw, QrCode, Power, Settings2, Smartphone, 
  ArrowRight, DollarSign, Calendar
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";

interface ChatMessage {
  id: string;
  sender: "client" | "bot";
  text: string;
  time: string;
}

export function ChatbotWhatsAppView() {
  const [token] = useState<string | null>(localStorage.getItem('token'));
  const [planName, setPlanName] = useState<string>("Trial 14 Dias");
  const [loading, setLoading] = useState(true);

  // Status de conexão e ativação
  const [botEnabled, setBotEnabled] = useState(true);
  const [connected, setConnected] = useState(true);
  const [botName, setBotName] = useState("Bia - Assistente Virtual");
  const [botTone, setBotTone] = useState<"amigavel" | "elegante" | "direto">("amigavel");
  const [reminderTime, setReminderTime] = useState("2 horas antes");
  const [autoDeposit, setAutoDeposit] = useState(true);
  const [welcomeMsg, setWelcomeMsg] = useState("Olá! Sou a assistente virtual do salão. Como posso te ajudar hoje? Posso agendar seu horário, passar a tabela de preços ou tirar suas dúvidas!");

  // Feedback de salvamento
  const [saved, setSaved] = useState(false);

  // Simulador de conversa WhatsApp
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Olá! Bem-vinda ao nosso salão ✨ Sou a Bia, sua assistente virtual. Como posso te ajudar hoje?",
      time: "14:28"
    },
    {
      id: "2",
      sender: "client",
      text: "Oi! Tem horário pra fazer corte e escova amanhã?",
      time: "14:29"
    },
    {
      id: "3",
      sender: "bot",
      text: "Temos sim! Para amanhã com nossa especialista temos os horários:\n\n⏰ 10:00\n⏰ 14:30\n⏰ 17:00\n\nQual desses fica melhor para você?",
      time: "14:29"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verifica o plano do salão
  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.subscriptions && data.subscriptions.length > 0) {
          interface SubItem {
            status?: string;
            plan?: { name?: string };
          }
          const sub = (data.subscriptions as SubItem[]).find((s) => s.status === "ACTIVE" || s.status === "TRIAL") || data.subscriptions[0];
          if (sub?.plan?.name) {
            setPlanName(sub.plan.name);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Se o plano for Studio, Elite, Premium ou Trial liberado
  const isPremium = planName.toLowerCase().includes("premium") || 
    planName.toLowerCase().includes("trial") || 
    planName.toLowerCase().includes("studio") || 
    planName.toLowerCase().includes("elite") || 
    planName.toLowerCase().includes("pro");

  // Enviar mensagem no simulador
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "client",
      text: text,
      time: timeStr
    };

    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    // Resposta inteligente simulada da IA orientada pelo tom de voz configurado
    setTimeout(() => {
      let botResponse = "";
      const lower = text.toLowerCase();
      const simpleBotName = botName.split(" -")[0];

      // 1. Saudação
      if (lower.match(/\b(oi|ol[aá]|bom dia|boa tarde|boa noite|oii|opa)\b/)) {
        if (botTone === "elegante") {
          botResponse = `Olá. Seja muito bem-vinda ao nosso espaço. Sou ${simpleBotName}, sua assistente virtual. Como posso lhe proporcionar uma experiência impecável hoje?`;
        } else if (botTone === "direto") {
          botResponse = `Olá! Sou a assistente virtual do salão. Em que posso te ajudar? Digite o serviço desejado para agendar ou ver valores.`;
        } else {
          botResponse = `Oii, tudo bem? ✨ Sou a ${simpleBotName}, sua assistente aqui no salão! Como posso te ajudar hoje? Posso agendar seu horário, passar a tabela de preços ou tirar qualquer dúvida! 💖`;
        }
      } 
      // 2. Preços e Tabela
      else if (lower.includes("preço") || lower.includes("quanto") || lower.includes("valor") || lower.includes("tabela") || lower.includes("serviço")) {
        if (botTone === "elegante") {
          botResponse = `Com todo prazer. Seguem os nossos principais atendimentos:\n\n✨ Escova & Tratamento Nutritivo: R$ 120,00\n✨ Coloração & Mechas Iluminadas: a partir de R$ 320,00\n✨ Manicure & Spa dos Pés: R$ 75,00\n✨ Design Personalizado de Sobrancelhas: R$ 50,00\n\nGostaria de reservar seu atendimento com nossa especialista?`;
        } else if (botTone === "direto") {
          botResponse = `Tabela de serviços:\n• Corte & Escova: R$ 95\n• Mechas: R$ 320\n• Manicure & Pedicure: R$ 70\n• Sobrancelhas: R$ 45\n\nQual serviço você quer agendar?`;
        } else {
          botResponse = `Aqui está nossa tabela com os serviços mais amados pelas clientes! ✨\n\n✂️ Corte & Escova: R$ 95,00\n🎨 Mechas Iluminadas & Reconstrução: R$ 320,00\n💅 Manicure & Pedicure: R$ 70,00\n👁️ Design de Sobrancelhas: R$ 45,00\n\nQual desses você gostaria de fazer? Posso consultar os horários livres agora! 💆‍♀️`;
        }
      }
      // 3. Agendamento & Horários
      else if (lower.includes("14:30") || lower.includes("10:00") || lower.includes("17:00") || lower.includes("agendar") || lower.includes("horário") || lower.includes("horario") || lower.includes("amanhã") || lower.includes("amanha") || lower.includes("vaga") || lower.includes("marcar")) {
        const timeChosen = lower.includes("10:00") ? "10:00" : lower.includes("17:00") ? "17:00" : "14:30";
        if (autoDeposit) {
          if (botTone === "elegante") {
            botResponse = `Perfeito. Pré-reservei seu atendimento para amanhã às ${timeChosen} com nossa especialista.\n\nPara garantir a exclusividade do seu horário e dos nossos profissionais, solicitamos o sinal de 20% (R$ 19,00) via PIX.\n\nChave PIX Copia e Cola:\n00020126580014BR.GOV.BCB.PIX0136belezapura@pix.com.br52040000530398654019.00\n\nAssim que o pagamento for realizado, sua vaga estará 100% garantida na agenda.`;
          } else if (botTone === "direto") {
            botResponse = `Horário pré-agendado: Amanhã às ${timeChosen}.\n\nSinal de 20% obrigatório: R$ 19,00.\nChave PIX: belezapura@pix.com.br\n\nEnvie o comprovante para confirmação imediata.`;
          } else {
            botResponse = `Oba! Já reservei seu horário com muito carinho para amanhã às ${timeChosen}! 🎉\n\nPara garantir a sua vaga na agenda da especialista e evitar faltas, solicitamos o sinalzinho de 20% (R$ 19,00) via PIX.\n\nChave Copia e Cola:\n00020126580014BR.GOV.BCB.PIX0136belezapura@pix.com.br52040000530398654019.00\n\nAssim que transferir me avisa aqui que confirmo na hora! ✨`;
          }
        } else {
          botResponse = `Perfeito! Seu agendamento para amanhã às ${timeChosen} foi confirmado com sucesso na nossa agenda! Te esperamos com todo o carinho. ✨`;
        }
      }
      // 4. Pagamento do sinal / PIX
      else if (lower.includes("pago") || lower.includes("pix") || lower.includes("comprovante") || lower.includes("paguei") || lower.includes("transferi") || lower.includes("pronto")) {
        botResponse = `Pagamento do sinal confirmado com sucesso! 🎉\n\n✅ Horário: Amanhã às 14:30\n✅ Profissional reservada com exclusividade\n✅ Lembrete automático agendado para ${reminderTime}\n\nVocê já pode relaxar, sua vaga está 100% garantida. Até amanhã! ✨`;
      }
      // 5. Localização / Endereço
      else if (lower.includes("onde") || lower.includes("endereço") || lower.includes("endereco") || lower.includes("local") || lower.includes("chegar") || lower.includes("fica")) {
        botResponse = `Nosso salão fica na Av. Principal da Beleza, nº 1500 - Jardins. Contamos com estacionamento privativo, Wi-Fi e um cappuccino delicioso esperando por você! ✨ Gostaria de agendar um horário?`;
      }
      // 6. Resposta padrão contextual
      else {
        if (botTone === "elegante") {
          botResponse = `Compreendi. Gostaria de verificar os horários disponíveis para esta semana ou prefere consultar nossa lista de serviços?`;
        } else if (botTone === "direto") {
          botResponse = `Posso agendar seu atendimento ou passar a tabela de valores. Qual serviço deseja realizar?`;
        } else {
          botResponse = `Com certeza! Posso te ajudar com isso agora mesmo. Qual serviço você gostaria de realizar e qual o melhor dia para você? ✨`;
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponse,
        time: timeStr
      }]);
      setIsTyping(false);
    }, 900);
  };

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-500" />
              Chatbot WhatsApp com IA (Atendente Virtual)
            </h1>
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[10px] uppercase tracking-wider border-none px-2.5 py-0.5 shadow-xs">
              <Crown className="w-3 h-3 mr-1" /> Premium
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Sua secretária virtual atende 24h no WhatsApp: responde dúvidas de clientes, consulta horários livres, agenda automaticamente e cobra o sinal via PIX para acabar com as faltas.
          </p>
        </div>

        {/* Status do Módulo */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`text-xs py-1 px-3 ${isPremium ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-bold" : "border-amber-500/30 text-amber-600 bg-amber-500/10"}`}>
            {isPremium ? "● Ativo no seu Plano" : "🔒 Requer Plano Premium"}
          </Badge>
        </div>
      </div>

      {/* Se NÃO for do Plano Premium e nem Trial, exibe o Paywall de Alto Impacto */}
      {!isPremium ? (
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Bot className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Desbloqueie a Atendente Virtual 24h no WhatsApp
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O recurso que faz os salões faturarem até <strong>35% a mais</strong>. Enquanto você atende clientes ou descansa no fim de semana, a Inteligência Artificial responde seu WhatsApp na hora, preenche a agenda e cobra o sinal via PIX.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Atendimento 24h / 7 dias</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nunca mais perca cliente porque demorou para responder uma mensagem no domingo à noite.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Cobrança Automática de PIX</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A IA gera a chave do sinal de 20% na conversa do WhatsApp e trava o horário apenas com pagamento.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Lembrete Anti-Falta</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dispara mensagem automática 2h antes com confirmação interativa de presença.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Button size="lg" className="h-13 px-8 text-sm font-bold shadow-lg shadow-primary/20">
              <Crown className="w-4 h-4 mr-2 text-amber-300" />
              Fazer Upgrade para Plano Studio (R$ 119,90/mês)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Sem contrato de fidelidade • Cancele quando quiser
            </p>
          </div>
        </div>
      ) : (
        /* Painel Completo do Chatbot Ativo */
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Coluna Esquerda: Configurações do Bot (7 colunas) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Card de Conexão WhatsApp Web */}
            <div className="p-5 bg-card border border-border rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${connected ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      WhatsApp Conectado
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {connected ? "+55 (11) 98765-4321 • WhatsApp Business Oficial" : "Desconectado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setConnected(!connected)}
                    className="text-xs h-9 cursor-pointer"
                  >
                    {connected ? "Desconectar" : "Conectar Novo Número"}
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Resposta automática com Inteligência Artificial
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={botEnabled} 
                    onChange={e => setBotEnabled(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>
            </div>

            {/* Configurações da IA */}
            <div className="p-5 bg-card border border-border rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Personalidade & Regras do Atendente Virtual
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Nome da Atendente Virtual
                  </label>
                  <input 
                    value={botName}
                    onChange={e => setBotName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border px-3 text-xs bg-background outline-none focus:border-primary transition-colors text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Tom de Voz da IA
                  </label>
                  <select 
                    value={botTone}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === "amigavel" || val === "elegante" || val === "direto") {
                        setBotTone(val);
                      }
                    }}
                    className="w-full h-10 rounded-xl border border-border px-3 text-xs bg-background outline-none focus:border-primary transition-colors text-foreground"
                  >
                    <option value="amigavel">Amigável & Caloroso (Emojis ✨)</option>
                    <option value="elegante">Formal & Elegante (Salão de Luxo)</option>
                    <option value="direto">Prático & Direto ao Ponto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Mensagem de Saudação Inicial
                </label>
                <textarea 
                  rows={3}
                  value={welcomeMsg}
                  onChange={e => setWelcomeMsg(e.target.value)}
                  className="w-full rounded-xl border border-border p-3 text-xs bg-background outline-none focus:border-primary transition-colors text-foreground resize-none leading-relaxed"
                />
              </div>

              {/* Gatilhos Automáticos */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                  <div>
                    <span className="font-semibold text-xs text-foreground block">
                      Cobrar Sinal PIX de 20% na Conversa
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      A IA envia o código PIX Copia e Cola para travar a vaga na agenda.
                    </span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoDeposit} 
                    onChange={e => setAutoDeposit(e.target.checked)} 
                    className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                  <div>
                    <span className="font-semibold text-xs text-foreground block">
                      Lembrete Anti-Furo Automático
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Envia mensagem com botão de confirmação antes do horário.
                    </span>
                  </div>
                  <select 
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                    className="h-8 rounded-lg border border-border px-2 text-xs bg-background text-foreground"
                  >
                    <option>2 horas antes</option>
                    <option>4 horas antes</option>
                    <option>24 horas antes</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button 
                  onClick={handleSaveSettings}
                  size="sm"
                  className="px-5 font-bold text-xs shadow-xs cursor-pointer"
                >
                  {saved ? <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Configurações Salvas</span> : "Salvar Configurações da IA"}
                </Button>
                {saved && <span className="text-xs text-emerald-600 font-semibold animate-fade-in">Atualizado em tempo real!</span>}
              </div>
            </div>

          </div>

          {/* Coluna Direita: Simulador de Smartphone do WhatsApp (5 colunas) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            <div className="w-full max-w-[340px] bg-zinc-900 border-4 border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[640px]">
              
              {/* Top Notch do Smartphone */}
              <div className="h-6 bg-zinc-900 w-full flex items-center justify-center">
                <div className="w-20 h-3.5 bg-zinc-800 rounded-full" />
              </div>

              {/* Header do WhatsApp */}
              <div className="bg-[#075E54] text-white p-3 flex items-center gap-2.5 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs border border-white/20">
                  <Bot className="w-5 h-5 text-emerald-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs truncate leading-tight flex items-center gap-1">
                    {botName}
                    <Badge className="bg-emerald-400 text-emerald-950 font-extrabold text-[8px] py-0 px-1 border-none">
                      IA
                    </Badge>
                  </div>
                  <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Online 24h
                  </div>
                </div>
              </div>

              {/* Área de Mensagens do WhatsApp */}
              <div 
                className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs bg-[#E5DDD5] dark:bg-zinc-950/80 scrollbar-hide"
                style={{ backgroundImage: "radial-gradient(#00000008 1px, transparent 1px)", backgroundSize: "12px 12px" }}
              >
                <div className="text-center my-1">
                  <span className="bg-black/10 text-zinc-600 dark:text-zinc-400 text-[10px] px-2 py-0.5 rounded-md font-medium">
                    HOJE
                  </span>
                </div>

                {messages.map((m) => (
                  <div 
                    key={m.id}
                    className={`flex flex-col max-w-[85%] ${m.sender === "client" ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div 
                      className={`p-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        m.sender === "client" 
                          ? "bg-[#DCF8C6] dark:bg-emerald-900/60 text-zinc-900 dark:text-white rounded-tr-xs" 
                          : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-tl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-line text-[11px]">{m.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-muted-foreground">
                        <span>{m.time}</span>
                        {m.sender === "client" && <CheckCheck className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-2xl rounded-tl-xs max-w-[85px] shadow-xs flex items-center gap-1 text-[10px] text-muted-foreground animate-pulse">
                    <span>digitando</span>
                    <span className="animate-bounce">...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Botões de Teste Rápido */}
              <div className="p-2 bg-zinc-800/90 border-t border-zinc-700 flex gap-1.5 overflow-x-auto scrollbar-hide text-[10px]">
                <button
                  onClick={() => handleSendMessage("Oi, tudo bem? Gostaria de agendar um horário!")}
                  className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white whitespace-nowrap cursor-pointer transition-colors"
                >
                  👋 "Oi, quero agendar"
                </button>
                <button
                  onClick={() => handleSendMessage("Qual o valor do corte e das mechas?")}
                  className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white whitespace-nowrap cursor-pointer transition-colors"
                >
                  💰 "Valores"
                </button>
                <button
                  onClick={() => handleSendMessage("Pode reservar amanhã às 14:30?")}
                  className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white whitespace-nowrap cursor-pointer transition-colors"
                >
                  ⏰ "Amanhã às 14:30"
                </button>
                <button
                  onClick={() => handleSendMessage("Pronto, acabei de pagar o PIX do sinal!")}
                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 rounded-md text-white whitespace-nowrap cursor-pointer transition-colors"
                >
                  ✅ "Paguei o PIX"
                </button>
                <button
                  onClick={() => handleSendMessage("Onde fica o salão de vocês?")}
                  className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white whitespace-nowrap cursor-pointer transition-colors"
                >
                  📍 "Localização"
                </button>
              </div>

              {/* Input de Mensagem */}
              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border-t border-border flex items-center gap-2">
                <input 
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  placeholder="Teste digitando como cliente..."
                  className="flex-1 h-9 bg-white dark:bg-zinc-800 rounded-full px-3.5 text-xs outline-none text-foreground border border-border"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="w-9 h-9 rounded-full bg-[#128C7E] text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#075E54] transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>

            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-3 max-w-[280px]">
              Simulador em tempo real. Digite uma mensagem acima para testar como a IA responde seus clientes.
            </p>

          </div>

        </div>
      )}
    </div>
  );
}
