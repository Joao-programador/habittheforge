import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Volume2, VolumeX, ShieldCheck, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuraMaximaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuraMaximaModal({ isOpen, onClose }: AuraMaximaModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Escuro com Blur Glass */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Card Cinematográfico da Aura Máxima */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden glass bg-zinc-950/95 border-2 border-amber-400/80 shadow-[0_0_60px_rgba(251,191,36,0.35)] z-10 flex flex-col"
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-transparent pointer-events-none" />

            {/* Header com Fechar e Áudio */}
            <div className="relative p-5 pb-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-display text-base sm:text-lg tracking-tight text-foreground leading-none">
                    100% DE LOCK-IN ATINGIDO
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/90 font-bold mt-1 block">
                    Aura Máxima Desbloqueada
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title={isMuted ? "Ativar som" : "Desativar som"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Fechar celebração"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Player de Vídeo Cinematográfico */}
            <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                src="/assets/gigachad_ascend.mp4"
                playsInline
                autoPlay
                loop
                muted={isMuted}
                className="w-full h-full object-cover select-none"
              />

              {/* Tag Flutuante no Vídeo */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/40 text-[10px] font-mono text-amber-300 flex items-center gap-1.5 font-bold shadow-md">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>NORDIC GIGACHAD · DESPERTO</span>
              </div>
            </div>

            {/* Rodapé com Mensagem e Botão */}
            <div className="p-5 pt-4 space-y-4 text-center">
              <p className="text-xs sm:text-sm text-foreground/90 font-sans leading-relaxed">
                Você executou todos os protocolos do dia, destruiu a procrastinação e ascendeu à sua versão definitiva.
              </p>

              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 h-11 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-bold tracking-tight rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Reconhecer Domínio
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
