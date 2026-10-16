import { useState } from "react";
import { Scissors, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

export function LoginScreen({ onLogin }: { onLogin: (token: string, role: string, name: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciais inválidas. Verifique seu e-mail e senha.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role || "owner");
      localStorage.setItem("userName", data.user.name || "Gestão");
      if (data.user.salonSlug) {
        localStorage.setItem("salonSlug", data.user.salonSlug);
      }

      onLogin(data.token, data.user.role || "owner", data.user.name || "Gestão");
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setError("Não foi possível conectar ao servidor. Verifique se a API está ativa.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm bg-card p-7 sm:p-8 rounded-3xl border border-border shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Beleza<span className="text-primary">Pura</span></span>
          <p className="text-xs text-muted-foreground mt-1">Acesso ao Painel de Gestão</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-medium mb-4 border border-red-200 dark:border-red-800 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
            <input 
              type="email" 
              required
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="seu@email.com"
              className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-background transition-all" 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label>
            <input 
              type="password" 
              required
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-background transition-all" 
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 font-semibold text-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar no Painel"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-5">
          Ainda não tem conta? <a href="/onboarding" className="text-primary font-medium hover:underline">Cadastre seu salão</a>
        </p>
      </div>
    </div>
  );
}