import { icons, Folder, type LucideIcon } from "lucide-react";

export const CATEGORY_ICON_OPTIONS = [
  { value: "Folder", label: "Carpeta" },
  { value: "House", label: "Hogar" },
  { value: "UtensilsCrossed", label: "Comida" },
  { value: "PiggyBank", label: "Ahorro" },
  { value: "Plane", label: "Viajes" },
  { value: "Hammer", label: "Reparaciones" },
  { value: "Car", label: "Transporte" },
  { value: "Heart", label: "Bienestar" },
  { value: "Gift", label: "Regalos" },
  { value: "GraduationCap", label: "Educación" },
  { value: "ShoppingBag", label: "Compras" },
  { value: "Sparkles", label: "Eventos" },
  { value: "HeartPulse", label: "Salud" },
  { value: "Stethoscope", label: "Medicina" },
  { value: "Pill", label: "Medicamentos" },
  { value: "ToyBrick", label: "Niños" },
  { value: "Blocks", label: "Juguetes" },
  { value: "Gamepad2", label: "Juegos" },
  { value: "Baby", label: "Bebés" },
  { value: "Milk", label: "Lactancia" },
  { value: "Shell", label: "Playa" },
  { value: "Umbrella", label: "Vacaciones" },
  { value: "Waves", label: "Mar" },
  { value: "Sun", label: "Verano" },
  { value: "Accessibility", label: "Ancianos" },
  { value: "Glasses", label: "Cuidado adulto mayor" },
  { value: "Armchair", label: "Descanso" },
  { value: "Dog", label: "Mascotas" },
  { value: "TreePine", label: "Naturaleza" },
  { value: "Briefcase", label: "Trabajo" },
  { value: "Shirt", label: "Ropa" },
  { value: "Smartphone", label: "Tecnología" },
  { value: "BookOpen", label: "Lectura" },
  { value: "Zap", label: "Energía" },
  { value: "Droplet", label: "Agua" },
  { value: "Wifi", label: "Internet" },
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number]["value"];

export function getCategoryIcon(name: string): LucideIcon {
  return (icons[name as keyof typeof icons] as LucideIcon | undefined) ?? Folder;
}

export function getCategoryIconLabel(name: string): string {
  return (
    CATEGORY_ICON_OPTIONS.find((option) => option.value === name)?.label ?? name
  );
}
