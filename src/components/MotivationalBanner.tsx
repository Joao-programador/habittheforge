import { motion } from "framer-motion";
import { Quote as QuoteIcon } from "lucide-react";
import { getQuoteOfTheDay } from "@/data/quotes";

export function MotivationalBanner() {
  const quote = getQuoteOfTheDay();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden surface-card p-5 md:p-6"
    >
      <div className="absolute inset-0 opacity-30 animate-shimmer" />
      <div className="relative flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
          <QuoteIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg md:text-xl leading-tight tracking-tight">
            "{quote.text}"
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-[0.2em]">
            — {quote.author}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
