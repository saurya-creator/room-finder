import React from "react";
import {
  Wifi,
  Wind,
  Tv,
  Car,
  Zap,
  ShieldCheck,
  Flame,
  UtensilsCrossed,
  Bath,
  WashingMachine,
  Sparkles,
  Layers,
  Dumbbell,
  Refrigerator,
  Key,
  CheckCircle2,
  LucideIcon,
} from "lucide-react";

interface AmenityIconProps {
  iconKey: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  wifi: Wifi,
  ac: Wind,
  tv: Tv,
  parking: Car,
  power: Zap,
  cctv: ShieldCheck,
  security: ShieldCheck,
  geyser: Flame,
  kitchen: UtensilsCrossed,
  food: UtensilsCrossed,
  bath: Bath,
  washer: WashingMachine,
  cleaning: Sparkles,
  lift: Layers,
  gym: Dumbbell,
  fridge: Refrigerator,
  key: Key,
};

export function AmenityIcon({ iconKey, className = "w-5 h-5 text-brand-600" }: AmenityIconProps) {
  const normalizedKey = iconKey.toLowerCase();
  const IconComponent = iconMap[normalizedKey] || CheckCircle2;
  return <IconComponent className={className} />;
}
