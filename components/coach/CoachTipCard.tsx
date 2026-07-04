import { Lightbulb } from "lucide-react";
import type { CoachTip } from "@/lib/finance/coach";
import { Card } from "@/components/ui/Card";

export function CoachTipCard({ tip }: { tip: CoachTip }) {
  return (
    <Card className="!p-6">
      <div className="flex gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Lightbulb size={16} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-normal leading-snug">{tip.title}</p>
          <p className="mt-1.5 text-sm font-light text-muted-light dark:text-muted-dark">{tip.detail}</p>
        </div>
      </div>
    </Card>
  );
}
