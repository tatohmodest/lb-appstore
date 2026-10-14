/* eslint-disable @next/next/no-img-element */
import { cn, initials, shade } from "@/lib/utils";

type Props = {
  name: string;
  iconUrl?: string | null;
  accentColor?: string;
  size?: number;
  className?: string;
};

export function AppIcon({ name, iconUrl, accentColor = "#00b369", size = 64, className }: Props) {
  const style = { width: size, height: size };

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        style={style}
        className={cn("app-icon shrink-0 bg-surface-2 object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{
        ...style,
        backgroundImage: `radial-gradient(120% 120% at 20% 10%, ${shade(accentColor, 0.35)} 0%, ${accentColor} 45%, ${shade(accentColor, -0.45)} 100%)`,
      }}
      className={cn("app-icon relative grid shrink-0 place-items-center overflow-hidden text-white", className)}
    >
      <span
        className="absolute -top-1/4 -right-1/4 size-3/4 rounded-full opacity-40 blur-md"
        style={{ background: shade(accentColor, 0.6) }}
      />
      <span className="relative font-semibold tracking-tight" style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </span>
    </span>
  );
}
