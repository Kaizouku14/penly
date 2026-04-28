"use client";

export const ClarityLegend = () => {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground p-2 border-t border-border">
      <div className="flex items-center gap-1">
        <div className="w-1 h-4 bg-emerald-400 rounded-sm" />
        <span>Clear — Easy to read</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1 h-4 bg-amber-400 rounded-sm" />
        <span>Moderate — Could improve</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1 h-4 bg-red-400 rounded-sm" />
        <span>Complex — Needs simplification</span>
      </div>
    </div>
  );
};
