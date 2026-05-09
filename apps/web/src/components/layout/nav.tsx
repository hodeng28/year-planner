'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/trades', label: '매매기록' },
  { href: '/analysis', label: '분석' },
  { href: '/settings', label: '설정' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:static md:border-t-0 md:border-r md:w-48 md:min-h-screen">
      <div className="flex md:flex-col">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 p-4 text-center text-sm md:text-left',
              pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50'
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
