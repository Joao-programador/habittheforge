import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { memo } from "react";

interface Props {
  done: boolean;
  onClick: () => void;
  color: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

function HabitCheckImpl({ done, onClick, color, size = "md", disabled }: Props) {
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: disabled ? 1 : 1.08 }}
      onClick={onClick}
      disabled={disabled}
      className={`${dim} rounded-lg flex items-center justify-center border-2 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed`}
      style={{
        background: done ? color : "transparent",
        borderColor: done ? color : "hsl(var(--border))",
        boxShadow: done ? `0 0 16px ${color}55` : undefined,
      }}
    >
      {done && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3.5} />
        </motion.div>
      )}
    </motion.button>
  );
}

export const HabitCheck = memo(HabitCheckImpl);
