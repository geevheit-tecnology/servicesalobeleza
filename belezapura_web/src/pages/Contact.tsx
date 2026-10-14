import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Building2, 
  Clock, 
  Layers
} from "lucide-react";
import { Button, Badge, Input } from "@/components/ui";

export default function Contact() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Dúvida sobre o GeevheitHair");
  const [message, setMessage] = useState("");

  const OFFICIAL_EMAIL = "geevheittecnology@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(OFFICIAL_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate submission / feedback
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleDirectEmail = () => {
    const mailtoSubject = encodeURIComponent(`[Contato Geevheith] ${subject}`);
    const mailtoBody = encodeURIComponent(
      `Nome: ${name || "Não informado"}\n` +
      `Email: ${email || "Não informado"}\n` +
      `WhatsApp: ${phone || "Não informado"}\n\n` +
      `Mensagem:\n${message || "Olá, gostaria de tirar uma dúvida sobre a plataforma."}`
    );
    window.location.href = `mailto:${OFFICIAL_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar ao Início</span>
            </button>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif text-lg font-semibold tracking-tight">GeevheitHair</span>
            </div>
          </div>

          <Badge variant="outline" className="border-primary/20 text-xs text-muted-foreground">
            Geevheit Technology
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-5 py-12 md:py-16 w-full animate-fade-up">
        {/* Banner */}
        <div className="mb-10 text-center md:text-left border-b border-border pb-8">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Canal de Atendimento
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mb-4 text-foreground">
            Fale Conosco & Tire suas Dúvidas
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
            Dúvidas sobre o funcionamento do <strong>GeevheitHair</strong>, planos comerciais ou suporte especializado? Nossa equipe está à disposição.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Email Card */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">E-mail Oficial</h3>
                  <p className="text-xs text-muted-foreground">Atendimento direto da Geevheith</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-2">
                <span className="text-xs md:text-sm font-mono font-medium text-foreground truncate select-all">
                  {OFFICIAL_EMAIL}
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  title="Copiar e-mail"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDirectEmail}
                  className="w-full text-xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Abrir no meu leitor de e-mail
                </Button>
              </div>
            </div>

            {/* Quick Service Guarantee */}
            <div className="p-6 rounded-3xl border border-border bg-card/60 space-y-3">
              <div className="flex items-center gap-2.5 text-foreground font-medium text-sm">
                <Clock className="w-4 h-4 text-primary" /> Tempo de Resposta
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Respondemos normalmente em até <strong>24 horas úteis</strong>. Todas as dúvidas sobre assinaturas, suporte e novas soluções são analisadas pela nossa equipe técnica.
              </p>
            </div>

            {/* Geevheith Ecosystem Teaser */}
            <div className="p-6 rounded-3xl border border-indigo-200/50 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                <Layers className="w-4 h-4" /> Ecossistema Geevheith
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Em breve, você poderá conhecer e contratar todo o nosso catálogo de aplicativos e ferramentas digitais diretamente no portal unificado da Geevheith.
              </p>
            </div>
          </div>

          {/* Right Column: Doubt / Question Form */}
          <div className="lg:col-span-7">
            <div className="p-6 md:p-8 rounded-3xl border border-border bg-card shadow-sm">
              {submitted ? (
                <div className="text-center py-10 space-y-5 animate-fade-up">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-medium text-foreground">
                      Mensagem Recebida!
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2 leading-relaxed">
                      Obrigado por entrar em contato. Sua dúvida foi registrada e retornaremos diretamente para seu e-mail ou WhatsApp o mais breve possível.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={handleDirectEmail}
                      className="text-sm"
                    >
                      <Mail className="w-4 h-4" /> Enviar cópia via e-mail direto
                    </Button>
                    <Button 
                      onClick={() => {
                        setSubmitted(false);
                        setMessage("");
                      }}
                      className="text-sm"
                    >
                      Enviar outra mensagem
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="font-serif text-xl font-medium text-foreground">
                      Formulário de Dúvidas
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Preencha os campos abaixo. Retornaremos sua solicitação com prioridade.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1.5">
                        Seu Nome *
                      </label>
                      <Input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Ana Silva"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1.5">
                        WhatsApp / Telefone
                      </label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">
                      Seu E-mail para Retorno *
                    </label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">
                      Assunto
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                    >
                      <option value="Dúvida sobre o GeevheitHair">Dúvida sobre o GeevheitHair</option>
                      <option value="Dúvida sobre planos e sinal PIX">Dúvida sobre planos e sinal PIX</option>
                      <option value="Suporte e implantação no salão">Suporte e implantação no salão</option>
                      <option value="Interesse em outros aplicativos Geevheith">Interesse em outros aplicativos da Geevheith</option>
                      <option value="Parceria comercial ou contratação">Parceria comercial ou contratação</option>
                      <option value="Outro assunto">Outro assunto</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">
                      Mensagem / Sua Dúvida *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva aqui detalhadamente como podemos te ajudar..."
                      className="w-full rounded-lg border border-border bg-card p-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none placeholder:text-muted-foreground"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full mt-2" 
                    disabled={loading}
                  >
                    <Send className="w-4 h-4" />
                    {loading ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-12">
        <div className="max-w-5xl mx-auto px-5 text-center text-xs text-muted-foreground">
          © 2026 Geevheith Software Solutions. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
