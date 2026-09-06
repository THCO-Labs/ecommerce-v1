import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  /** Usually the units on hand, so the control cannot ask for what is not there. */
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const clamp = (next: number) => Math.min(Math.max(next, min), Math.max(max, min));

  return (
    <div className={cn("border-input inline-flex items-center rounded-md border", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-r-none"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="tabular w-9 text-center text-sm" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-l-none"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
