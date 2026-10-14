import { useId } from "react";
import { cn } from "@/lib/utils";

export function Stars({ value, size = 12, className }: { value: number; size?: number; className?: string }) {
  const uid = useId();
  return (
    <span className={cn("inline-flex items-center gap-[1px]", className)} aria-label={`${value.toFixed(1)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={`${uid}${i}`}>
                <stop offset={`${fill * 100}%`} stopColor="currentColor" />
                <stop offset={`${fill * 100}%`} stopColor="currentColor" stopOpacity=".22" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${uid}${i})`}
              d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
            />
          </svg>
        );
      })}
    </span>
  );
}
