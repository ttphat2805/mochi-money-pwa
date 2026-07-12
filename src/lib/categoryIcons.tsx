import {
  Baby,
  Banknote,
  Beer,
  Bike,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  CarTaxiFront,
  Cat,
  Clapperboard,
  Coffee,
  CreditCard,
  CupSoda,
  Dog,
  Droplets,
  Dumbbell,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  IceCreamCone,
  Music,
  Package,
  PartyPopper,
  PawPrint,
  Phone,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  Plug,
  Receipt,
  Scissors,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Stethoscope,
  Tv,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { EMOJI_TO_ICON } from '@/lib/categoryIconMigration'

/**
 * Category icon registry — the single source of truth for icons a category
 * can use. `BudgetCategory.icon` stores one of these keys.
 */
export const CATEGORY_ICONS: { name: string; Icon: LucideIcon }[] = [
  // Food & drink
  { name: 'utensils', Icon: Utensils },
  { name: 'coffee', Icon: Coffee },
  { name: 'cup-soda', Icon: CupSoda },
  { name: 'pizza', Icon: Pizza },
  { name: 'ice-cream-cone', Icon: IceCreamCone },
  { name: 'beer', Icon: Beer },
  // Shopping
  { name: 'shopping-cart', Icon: ShoppingCart },
  { name: 'shopping-bag', Icon: ShoppingBag },
  { name: 'shirt', Icon: Shirt },
  { name: 'sparkles', Icon: Sparkles },
  { name: 'scissors', Icon: Scissors },
  // Transport
  { name: 'car', Icon: Car },
  { name: 'car-taxi-front', Icon: CarTaxiFront },
  { name: 'bus', Icon: Bus },
  { name: 'bike', Icon: Bike },
  { name: 'fuel', Icon: Fuel },
  { name: 'wrench', Icon: Wrench },
  { name: 'plane', Icon: Plane },
  // Home & utilities
  { name: 'house', Icon: House },
  { name: 'plug', Icon: Plug },
  { name: 'droplets', Icon: Droplets },
  { name: 'wifi', Icon: Wifi },
  { name: 'smartphone', Icon: Smartphone },
  { name: 'phone', Icon: Phone },
  { name: 'tv', Icon: Tv },
  // Entertainment & lifestyle
  { name: 'gamepad-2', Icon: Gamepad2 },
  { name: 'clapperboard', Icon: Clapperboard },
  { name: 'music', Icon: Music },
  { name: 'party-popper', Icon: PartyPopper },
  { name: 'dumbbell', Icon: Dumbbell },
  // Health & education
  { name: 'pill', Icon: Pill },
  { name: 'heart-pulse', Icon: HeartPulse },
  { name: 'stethoscope', Icon: Stethoscope },
  { name: 'graduation-cap', Icon: GraduationCap },
  { name: 'book-open', Icon: BookOpen },
  // Family & pets
  { name: 'baby', Icon: Baby },
  { name: 'dog', Icon: Dog },
  { name: 'cat', Icon: Cat },
  { name: 'paw-print', Icon: PawPrint },
  // Money & work
  { name: 'credit-card', Icon: CreditCard },
  { name: 'banknote', Icon: Banknote },
  { name: 'wallet', Icon: Wallet },
  { name: 'piggy-bank', Icon: PiggyBank },
  { name: 'receipt', Icon: Receipt },
  { name: 'briefcase', Icon: Briefcase },
  { name: 'gift', Icon: Gift },
  // Fallback
  { name: 'package', Icon: Package },
]

const ICON_MAP = new Map(CATEGORY_ICONS.map((e) => [e.name, e.Icon]))

/** Resolve any stored icon value (registry name or legacy emoji) to a component. */
export function resolveCategoryIcon(value: string | undefined | null): LucideIcon {
  if (!value) return Package
  return ICON_MAP.get(value) ?? ICON_MAP.get(EMOJI_TO_ICON[value] ?? '') ?? Package
}
