import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Today\'s Picks', path: '/picks' },
    { name: 'News', path: '/news' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Bankroll Manager', path: '/bankroll' },
    { name: 'Subscriptions', path: '/subscribe' }
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-baseball-ball text-secondary text-2xl"></i>
            <Link href="/">
              <span className="text-2xl font-bold font-heading cursor-pointer">MLB EDGE</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a className={`font-medium transition ${isActive(link.path) ? 'text-secondary' : 'hover:text-secondary'}`}>
                  {link.name}
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="secondary" className="hidden md:inline-block">
                Sign In
              </Button>
            </Link>
            
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-primary text-white">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.path} href={link.path}>
                      <a
                        className={`font-medium transition ${isActive(link.path) ? 'text-secondary' : 'hover:text-secondary'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </a>
                    </Link>
                  ))}
                  <Link href="/login">
                    <Button variant="secondary" className="mt-4 w-full" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
