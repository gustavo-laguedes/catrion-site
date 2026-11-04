import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { Header, type HeaderTheme } from './Header';
import { PageMeta } from './PageMeta';
import { PageTransition } from './PageTransition';

export type MainLayoutContext = {
  setHeaderTheme: (theme: HeaderTheme) => void;
};

export function MainLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [headerTheme, setHeaderTheme] = useState<HeaderTheme>('dark');

  return (
    <PageTransition><div className="flex min-h-svh flex-col bg-background text-foreground">
      <PageMeta />
      <Header theme={headerTheme} />
      <main className="flex-1"><Outlet context={{ setHeaderTheme } satisfies MainLayoutContext} /></main>
      <Footer />
    </div></PageTransition>
  );
}
