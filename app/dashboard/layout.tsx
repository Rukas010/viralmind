'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Video,
  PlusCircle,
  Layout,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
} from 'lucide-react';
import { getCurrentUser, getProfile, signOut } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: add your dashboard layout implementation here
  return <>{children}</>;
}