import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlannerEvent } from "@/hooks/usePlanner";

interface Props {
  event: PlannerEvent;
  date: string;
  completed?: boolean;
  compact?: boolean;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onToggleComplete?: (e: React.MouseEvent) => void;
}

function toTimeStr(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function EventBlock({ event, completed, compact, style, onClick, onToggleComplete }: Props) {
  const end = event.startMinutes + event.durationMinutes;
  const isHabit = !!event.habit_id;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...style,
        background: `linear-gradient(135deg, ${event.color}33, ${event.color}1a)`,
        borderLeft: `3px solid ${event.color}`,
      }}
      className={cn(
        "group text-left rounded-md px-2 py-1 overflow-hidden transition-all hover:brightness-125 hover:scale-[1.01] backdrop-blur-sm",
        completed && "opacity-60",
        compact ? "text-[10px] leading-tight" : "text-xs"
      )}
    >
      <div className="flex items-start gap-1.5 min-w-0">
        {isHabit && onToggleComplete && (
          <span
            onClick={(e) => { e.stopPropagation(); onToggleComplete(e); }}
            className={cn(
              "shrink-0 mt-0.5 w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center cursor-pointer transition",
              completed ? "bg-success border-success" : "border-foreground/40 hover:border-foreground"
            )}
          >
            {completed && <Check className="w-2.5 h-2.5 text-background" strokeWidth={4} />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className={cn("font-semibold truncate", completed && "line-through")}>
            {event.emoji && <span className="mr-1">{event.emoji}</span>}
            {event.title}
          </div>
          {!compact && (
            <div className="text-[10px] opacity-70 font-mono">
              {toTimeStr(event.startMinutes)}–{toTimeStr(end)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
