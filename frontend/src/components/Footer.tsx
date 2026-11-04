import { BrandLogo } from './BrandLogo';
import { Container } from './Container';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <Container width="wide" className="flex flex-col justify-between gap-8 py-12 md:flex-row md:items-end">
        <div>
          <BrandLogo variant="dark" className="w-44" />
          <p className="mt-5 type-label text-muted-foreground">Tecnologia e Criação.</p>
          <p className="mt-2 type-micro text-muted-foreground">© {new Date().getFullYear()} Catrion</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3 type-label text-muted-foreground" aria-label="Redes sociais e contato">
          <a className="hover:text-foreground" href="mailto:catrion.tec@gmail.com">E-mail</a>
          <a className="hover:text-foreground" href="https://instagram.com/catrionoficial" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="hover:text-foreground" href="https://www.linkedin.com/company/catriontech/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </nav>
      </Container>
    </footer>
  );
}
