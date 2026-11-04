import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const siteTitle = 'Catrion | Tecnologia e Criação';
const siteDescription = 'A Catrion cria ecossistemas digitais sob medida, conectando tecnologia, design e soluções para cada negócio.';

export function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const title = pathname === '/contato' ? 'Contato | Catrion' : pathname === '/' ? siteTitle : 'Página não encontrada | Catrion';
    const description = pathname === '/contato' ? 'Converse com a Catrion sobre seu projeto digital.' : siteDescription;
    const socialDescription = pathname === '/' ? 'Sites, sistemas e aplicativos são partes de algo maior. Criamos ecossistemas digitais.' : description;
    document.title = title;
    for (const [selector, content] of [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', socialDescription],
      ['meta[name="twitter:title"]', title],
      ['meta[name="twitter:description"]', socialDescription]
    ]) {
      const element = document.querySelector<HTMLMetaElement>(selector);
      if (element) element.content = content;
    }
  }, [pathname]);

  return null;
}
