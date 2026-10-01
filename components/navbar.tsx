'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Bell, Package2, ShieldAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package2 className="h-5 w-5" />
            </div>
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight">
              Campus Recover
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/reports/lost"
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.startsWith('/reports/lost') ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
              Lost Items
            </Link>
            <Link
              href="/reports/found"
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.startsWith('/reports/found') ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
              Found Items
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!loading && user ? (
            <>
              <Link href="/reports/lost/new">
                <Button variant="outline" size="sm" className="hidden sm:flex">Report Lost</Button>
              </Link>
              <Link href="/reports/found/new">
                <Button size="sm" className="hidden sm:flex">Report Found</Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <Bell className="h-5 w-5" />
                  {/* Note: In a real app we'd fetch unread count */}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { window.location.assign('/dashboard'); }}>
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { window.location.assign('/claims'); }}>
                    My Claims
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { window.location.assign('/admin/dashboard'); }} className="text-destructive font-medium">
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : !loading ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
