'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            EVENZA
          </Link>
          <div className="hidden gap-5 sm:flex">
            <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground">
              Events
            </Link>
            <Link href="/clubs" className="text-sm text-muted-foreground hover:text-foreground">
              Clubs
            </Link>
            <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground">
              Categories
            </Link>
            {user && (user.role === 'organizer' || user.role === 'admin') && (
              <Link href="/organizer" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
