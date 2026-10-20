import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate("/", { replace: true });
  }, [session, loading, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else navigate("/", { replace: true });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data.session) {
      setSent(true);
      toast.success("Confirme seu e-mail para ativar a conta.");
    } else {
      navigate("/", { replace: true });
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-border/50 overflow-hidden">
            <img
              src="/assets/logo.png"
              alt="Forge Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <h1 className="font-display text-3xl tracking-tight mt-4">FORGE</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Sua disciplina em todos os dispositivos. Entre e continue forjando.
          </p>
        </div>

        <Card className="p-6">
          {sent ? (
            <div className="text-center space-y-3">
              <p className="font-display text-lg tracking-tight">Verifique seu e-mail</p>
              <p className="text-sm text-muted-foreground">
                Enviamos um link de confirmação para <span className="text-foreground">{email}</span>. Clique
                nele e volte aqui para entrar.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Voltar
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full mb-5">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={signIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-in">E-mail</Label>
                    <Input
                      id="email-in"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pass-in">Senha</Label>
                    <Input
                      id="pass-in"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-up">E-mail</Label>
                    <Input
                      id="email-up"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pass-up">Senha</Label>
                    <Input
                      id="pass-up"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="mínimo 6 caracteres"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Criando..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={google}>
                Entrar com Google
              </Button>
            </Tabs>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 italic">
          "Disciplina é liberdade." — Jocko Willink
        </p>
      </div>
    </main>
  );
}
