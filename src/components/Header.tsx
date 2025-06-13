'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  // Don't show header on preview and slug pages
  const hideHeader = pathname.startsWith('/preview/') || 
                    (pathname !== '/' && pathname !== '/signin' && !pathname.startsWith('/api'));

  if (!user || hideHeader) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{user.email}</span>
        </div>
        
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </header>
  );
} 