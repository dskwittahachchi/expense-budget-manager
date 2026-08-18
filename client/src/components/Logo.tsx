import { Sparkles } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Finora home">
      <span className="brand-mark"><Sparkles size={18} strokeWidth={2.4} /></span>
      {!compact && <span className="brand-name">finora<span>.</span></span>}
    </div>
  );
}

