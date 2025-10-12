'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            🏃 RUNNER
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Jackpot
            </Link>
            <Link
              href="/coinflip"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Coinflip
            </Link>
            <Link
              href="/affiliates"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Affiliates
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <Link
            href="/provably-fair"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Provably Fair
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/support"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Support
          </Link>

          {/* Wallet Button */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}

