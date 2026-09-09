import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EventBlock } from "./EventBlock";
import type { PlannerEvent } from "@/hooks/usePlanner";
import { format } from "date-fns";

import { Layers } from "lucide-react";

interface Props {
  cluster: PlannerEvent[];
  dateObj: Date;
  isHabitCompleted: (habitId: string, date: Date) => boolean;
  onEventClick: (ev: PlannerEvent) => void;
  onToggleHabit: (habitId: string, date: Date) => void;
  compact?: boolean;
}

export function EventCluster({ cluster, dateObj, isHabitCompleted, onEventClick, onToggleHabit, compact }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateStr = format(dateObj, "yyyy-MM-dd");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (cluster.length === 1) {
    const ev = cluster[0];
    return (
      <EventBlock
        event={ev}
        date={dateStr}
        completed={ev.habit_id ? isHabitCompleted(ev.habit_id, dateObj) : false}
        compact={compact}
        style={{ height: "100%" }}
        onClick={() => onEventClick(ev)}
        onToggleComplete={ev.habit_id ? () => onToggleHabit(ev.habit_id!, dateObj) : undefined}
      />
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            layoutId={`cluster-${cluster[0].id}-${dateStr}`}
            onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
            className="w-full h-full cursor-pointer relative group"
            whileHover={{ scale: 1.02 }}
          >
            {cluster.slice(0, 3).reverse().map((ev, i, arr) => {
              const idx = arr.length - 1 - i;
              const isFront = idx === 0;
              return (
                <div
                  key={ev.id}
                  className={`absolute inset-0 rounded-md shadow-sm border border-background/20 backdrop-blur-sm ${isFront ? "overflow-hidden" : ""}`}
                  style={{
                    background: `linear-gradient(135deg, ${ev.color}50, ${ev.color}20)`,
                    borderLeft: `3px solid ${ev.color}`,
                    top: idx * 4,
                    left: idx * 4,
                    right: -idx * 4,
                    bottom: -idx * 4,
                    zIndex: 10 - idx,
                  }}
                >
                  {isFront && (
                    <div className="w-full h-full pointer-events-none opacity-95">
                      <EventBlock
                        event={ev}
                        date={dateStr}
                        completed={ev.habit_id ? isHabitCompleted(ev.habit_id, dateObj) : false}
                        compact={compact}
                        style={{ height: "100%", background: "transparent", borderLeft: "none" }}
                        onClick={() => {}}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            <div className="absolute top-1 right-1 z-20 pointer-events-none">
              <span className="flex items-center gap-1 bg-background/95 text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-border/50">
                <Layers className="w-3 h-3 text-primary" /> +{cluster.length - 1}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layoutId={`cluster-${cluster[0].id}-${dateStr}`}
            className="absolute z-[100] top-0 left-0 w-[220px] bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-xl p-2 flex flex-col gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Blocos sobrepostos
              </span>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-muted-foreground hover:text-foreground text-xs p-1">
                &times;
              </button>
            </div>
            {cluster.map((ev) => (
              <div key={ev.id} className="min-h-[48px]">
                <EventBlock
                  event={ev}
                  date={dateStr}
                  completed={ev.habit_id ? isHabitCompleted(ev.habit_id, dateObj) : false}
                  compact={false}
                  style={{ height: "100%" }}
                  onClick={() => { setIsOpen(false); onEventClick(ev); }}
                  onToggleComplete={ev.habit_id ? () => onToggleHabit(ev.habit_id!, dateObj) : undefined}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
