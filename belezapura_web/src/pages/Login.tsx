import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      // Salva dados no local storage
      localStorage.setItem("token", data.token);
      if (data.user.salonSlug) localStorage.setItem("salonSlug", data.user.salonSlug);
      if (data.user.role) localStorage.setItem("role", data.user.role);

      // Redireciona baseado na permissão
      if (data.user.role === "superadmin") {
        navigate("/superadmin");
      } else {
        navigate("/admin");
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate("/")}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground">Acesse sua conta</h1>
          <p className="text-muted-foreground mt-2 text-center">Bem-vindo(a) de volta ao beautyOS</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
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

            <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</>
              ) : (
                <>Entrar <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Ainda não tem conta? <button onClick={() => navigate("/onboarding")} className="text-primary font-medium hover:underline">Crie seu salão grátis</button>
        </p>
      </div>
    </div>
  );
}
