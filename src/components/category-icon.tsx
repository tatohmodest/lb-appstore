import {
  BarChart3,
  Briefcase,
  Camera,
  Car,
  Code2,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  House,
  MessageCircle,
  Music,
  Newspaper,
  Palette,
  Plane,
  ShoppingBag,
  Sparkles,
  Users,
  Utensils,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  briefcase: Briefcase,
  chat: MessageCircle,
  music: Music,
  camera: Camera,
  health: HeartPulse,
  education: GraduationCap,
  games: Gamepad2,
  shopping: ShoppingBag,
  food: Utensils,
  travel: Plane,
  tools: Wrench,
  sparkles: Sparkles,
  design: Palette,
  news: Newspaper,
  social: Users,
  analytics: BarChart3,
  developer: Code2,
  home: House,
  transport: Car,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? Sparkles;
  return <Icon className={className} />;
}
