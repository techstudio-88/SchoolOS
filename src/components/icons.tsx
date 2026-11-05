"use client";
import {
  Accessibility, Award, Backpack, BadgeCheck, Banknote, BarChart3, Bed, BedDouble, Bell, Bot, Brain,
  Briefcase, Building2, Bus, Calculator, CalendarCheck, CalendarClock, ClipboardList, Clock, Crown,
  DoorOpen, FileCheck2, FileText, Files, FlaskConical, Gavel, GraduationCap, HandCoins, Handshake,
  HeartPulse, Home, Landmark, Library, Megaphone, MonitorPlay, NotebookPen, Package, PartyPopper,
  PencilRuler, School, Scale, Server, ShieldCheck, ShieldHalf, Shirt, Trophy, UserPlus, UserSearch,
  Users, UsersRound, UtensilsCrossed, Wallet, Wrench, BookOpen, Sparkles, type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const MAP: Record<string, ComponentType<LucideProps>> = {
  Accessibility, Award, Backpack, BadgeCheck, Banknote, BarChart3, Bed, BedDouble, Bell, Bot, Brain,
  Briefcase, Building2, Bus, Calculator, CalendarCheck, CalendarClock, ClipboardList, Clock, Crown,
  DoorOpen, FileCheck2, FileText, Files, FlaskConical, Gavel, GraduationCap, HandCoins, Handshake,
  HeartPulse, Home, Landmark, Library, Megaphone, MonitorPlay, NotebookPen, Package, PartyPopper,
  PencilRuler, School, Scale, Server, ShieldCheck, ShieldHalf, Shirt, Trophy, UserPlus, UserSearch,
  Users, UsersRound, UtensilsCrossed, Wallet, Wrench, BookOpen, Sparkles,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = MAP[name] ?? Sparkles;
  return <C {...props} />;
}
