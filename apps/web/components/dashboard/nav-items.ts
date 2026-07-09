import { LayoutDashboard, Package, Settings, ShoppingCart, Truck } from 'lucide-react';

export const navItems = [
  { href: '/', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/catalogue', label: 'Catalogue', icon: Package },
  { href: '/commandes', label: 'Commandes', icon: ShoppingCart },
  { href: '/livraisons', label: 'Livraisons', icon: Truck },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
] as const;
