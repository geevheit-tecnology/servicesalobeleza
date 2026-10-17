import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Entrando...");
  const [error, setError] = useState("");

  const api = import.meta.env.VITE_API_URL || "http://localhost:3050";

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

    const timer1 = setTimeout(() => {
      setLoadingMessage("Conectando ao cluster seguro...");
    }, 1500);

    const timer2 = setTimeout(() => {
      setLoadingMessage("Inicializando portal executivo...");
    }, 4500);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch(`${api}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        signal: controller.signal
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role || "superadmin");
      localStorage.setItem("userName", data.user.name || "Administrador");
      if (data.user.salonSlug) localStorage.setItem("salonSlug", data.user.salonSlug);

      if (data.user.role === "superadmin") {
        navigate("/superadmin", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }

    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timeoutId);

      const errMsg = err instanceof Error ? err.message : "Erro inesperado ao fazer login";
      if (err instanceof Error && err.name === "AbortError") {
        setError("O servidor demorou para responder. Por favor, tente novamente.");
      } else if (errMsg === "Failed to fetch") {
        setError("Erro de conexão com o servidor. Verifique se o backend está rodando.");
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-4 text-stone-800">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#992E46] to-[#B83E58] flex items-center justify-center shadow-lg shadow-[#B83E58]/20 mb-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/")}
          >
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Portal do SuperAdmin</h1>
          <p className="text-stone-500 mt-2 text-center text-sm">Gestão Executiva da Plataforma BelezaPura</p>
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
          <span>Autenticação Executiva Segura</span>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Ainda não tem conta?{" "}
          <button onClick={() => navigate("/onboarding")} className="text-primary font-medium hover:underline">
            Crie seu salão grátis
          </button>
        </p>
      </div>
    </div>
  );
}
