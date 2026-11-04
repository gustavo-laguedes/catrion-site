import { useOutletContext } from 'react-router-dom';
import { HomeNarrative } from '../components/home/HomeNarrative';
import type { MainLayoutContext } from '../components/MainLayout';

export function HomePage() {
  const { setHeaderTheme } = useOutletContext<MainLayoutContext>();

  return <HomeNarrative setHeaderTheme={setHeaderTheme} />;
}
