'use client';

import React from 'react';
import { AdminProvider } from '@/hooks/useAdmin';

export default function AdminProviderWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <AdminProvider>{children}</AdminProvider>;
}