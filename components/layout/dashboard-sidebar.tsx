'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface DashboardSidebarProps {
  items: NavItem[];
}

export function DashboardSidebar({ items }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
