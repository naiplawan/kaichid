import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Users, Book, Settings, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showNavigation?: boolean;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string | undefined }>;
  requiresAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, requiresAuth: true },
  { href: '/solo', label: 'Solo Play', icon: User, requiresAuth: true },
  { href: '/create-room', label: 'Multiplayer', icon: Users, requiresAuth: true },
  { href: '/journal', label: 'Journal', icon: Book, requiresAuth: true },
  { href: '/demo', label: 'Demo', icon: Settings, requiresAuth: false },
];

export function MobileLayout({ 
  children, 
  showHeader = true, 
  showNavigation = true 
}: MobileLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredNavItems = navigationItems.filter(item => 
    !item.requiresAuth || user
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile/Desktop Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container flex h-14 md:h-16 items-center px-4 md:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.h1 
                className="text-xl md:text-2xl font-bold text-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                KAICHID
              </motion.h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 mx-6">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4 ml-auto">
              {/* User Info - Desktop */}
              {user && (
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-sm text-muted-foreground">
                    Welcome back!
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              {isMobile && showNavigation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-72 bg-background border-l shadow-lg"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="p-4 border-b bg-muted/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Welcome back!</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                <nav className="flex-1 p-4">
                  <div className="space-y-2">
                    {filteredNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = router.pathname === item.href;
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                            isActive 
                              ? 'text-primary bg-primary/10 border border-primary/20' 
                              : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </nav>

                {/* Logout Button */}
                {user && (
                  <div className="p-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full flex items-center space-x-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      {isMobile && showNavigation && !isMobileMenuOpen && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="flex items-center justify-around px-2 py-2">
            {filteredNavItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs transition-colors min-w-0 ${
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate max-w-full">{item.label}</span>
                </Link>
              );
            })}
            
            {/* More button for additional items */}
            {filteredNavItems.length > 4 && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Menu className="h-5 w-5" />
                <span>More</span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Spacer for bottom navigation */}
      {isMobile && showNavigation && (
        <div className="h-16" />
      )}
    </div>
  );
}

export default MobileLayout;