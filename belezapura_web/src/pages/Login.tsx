import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Entrando...");
  const [error, setError] = useState("");

  const api = import.meta.env.VITE_API_URL || "http://localhost:3050";

  // Silent warm-up of backend service on page mount
  useEffect(() => {
    try {
      fetch(`${api}/api/public/plans`, { method: "GET" }).catch(() => {});
    } catch (e) {
      // ignore
    }
  }, [api]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setLoadingMessage("Autenticando...");

    // Friendly progressive messaging if cloud server (e.g. Render) is taking seconds to spin up
    const timer1 = setTimeout(() => {
      setLoadingMessage("Conectando ao servidor seguro...");
    }, 1500);

    const timer2 = setTimeout(() => {
      setLoadingMessage("Inicializando sua sessão...");
    }, 4500);

    const cleanEmail = email.trim().toLowerCase();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch(`${api}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
        signal: controller.signal
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao fazer login. Verifique seus dados.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role || "owner");
      localStorage.setItem("userName", data.user.name || "Gestão");
      if (data.user.salonSlug) localStorage.setItem("salonSlug", data.user.salonSlug);

      if (data.user.role === "superadmin") {
        navigate("/superadmin", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }

    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timeoutId);

      if (err.name === "AbortError") {
        setError("O servidor demorou para responder. Por favor, tente novamente.");
      } else if (err.message === "Failed to fetch") {
        setError("Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/")}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-3xl tracking-tight text-foreground">
            Beleza<span className="text-primary">Pura</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-center text-sm">
            Acesse o painel do seu salão ou clínica
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center animate-in fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-1.5 text-muted-foreground">E-mail</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full h-12 rounded-xl border border-border pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-background transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5 text-muted-foreground">Senha</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full h-12 rounded-xl border border-border pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-background transition-all"
                  required
                />
              </div>
              <div className="flex justify-end mt-2">
                <a href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</a>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold shadow-md" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">{loadingMessage}</span>
                </div>
              ) : (
                <>Entrar <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Conexão criptografada de ponta a ponta</span>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Ainda não tem conta?{" "}
          <button onClick={() => navigate("/onboarding")} className="text-primary font-medium hover:underline">
            Crie seu salão grátis
          </button>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-4 opacity-60 hover:opacity-100 transition-opacity">
          É dono da plataforma?{" "}
          <button onClick={() => navigate("/login-admin")} className="font-medium hover:underline text-primary">
            Acessar Admin Global
          </button>
        </p>
      </div>
    </div>
  );
}
