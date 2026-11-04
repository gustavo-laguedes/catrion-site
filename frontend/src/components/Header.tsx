import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { Container } from './Container';

export type HeaderTheme = 'dark' | 'light';

type HeaderProps = {
  theme?: HeaderTheme;
};

export function Header({ theme = 'dark' }: HeaderProps) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isLight = isHome && theme === 'light';

  return (
    <header
      className={`site-header ${isHome ? 'site-header--home fixed' : 'site-header--default sticky'} ${isLight ? 'site-header--light' : 'site-header--dark'} top-0 z-header w-full`}
      data-header-theme={isLight ? 'light' : 'dark'}
    >
      <Container width="wide" className={`flex items-center justify-between gap-8 ${isHome ? 'min-h-[4.5rem]' : 'min-h-20'}`}>
        <Link to="/" aria-label="Catrion — início" className="site-header__brand inline-flex shrink-0 items-center">
          <BrandLogo variant={isLight ? 'light' : 'dark'} decorative className={isHome ? 'w-[7.5rem] sm:w-[8.5rem]' : 'w-36 sm:w-44'} />
        </Link>
        <nav aria-label="Navegação principal" className="site-header__nav flex items-center gap-5 sm:gap-8">
          {isHome ? <><a href="#sobre">Sobre</a><a href="#o-que-fazemos"><span className="nav-long">O que fazemos</span><span className="nav-short">Serviços</span></a><a href="#como-trabalhamos"><span className="nav-long">Como trabalhamos</span><span className="nav-short">Processo</span></a></> : <Link to="/">Início</Link>}
          <Link to="/contato">Contato</Link>
        </nav>
      </Container>
    </header>
  );
}
