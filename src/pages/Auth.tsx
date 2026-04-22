import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Flame, Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (mode: "signin" | "signup") => {
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Conta criada — bem-vindo à FORGE.");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Discipline starts now.");
        navigate("/");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-primary-glow/20 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary glow-primary mb-5">
            <Flame className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-5xl tracking-tight mb-2">FORGE</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.25em]">
            Discipline · Consistency · Iron
          </p>
        </div>

        <div className="surface-card p-8">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            {(["signin", "signup"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${mode}-email`}>Email</Label>
                  <Input
                    id={`${mode}-email`}
                    type="email"
                    placeholder="você@forge.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${mode}-password`}>Senha</Label>
                  <Input
                    id={`${mode}-password`}
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 glow-primary"
                  onClick={() => handleAuth(mode)}
                  disabled={loading || !email || !password}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "signin" ? "ENTRAR NA FORJA" : "FORJAR MINHA CONTA"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 italic">
          "Disciplina é igual a liberdade." — Jocko Willink
        </p>
      </motion.div>
    </div>
  );
}
